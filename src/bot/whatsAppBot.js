/*
 * WhatsApp Wish Scheduler - The Stoic Spirit
 * Copyright (C) 2025 The Stoic Spirit
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 */
const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const qrcode = require("qrcode-terminal");
const config = require("../config/config");
const logger = require("../utils/logger");
const DataService = require("../services/dataService");
const MessageService = require("../services/messageService");
const SchedulerService = require("../services/schedulerService");
const CommandManager = require("../commands/commandManager");
const { isLID, normalizePhoneNumber } = require("../utils/validators");

class WhatsAppBot {
  constructor() {
    this.sock = null;
    this.dataService = new DataService();
    this.messageService = null;
    this.schedulerService = null;
    this.commandManager = null;
    this.hasShownLIDWarning = false;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.start();
  }

  async start() {
    try {
      const { state, saveCreds } = await useMultiFileAuthState(
        config.AUTH_STATE_DIR
      );

      this.sock = makeWASocket({
        auth: state,
        logger,
        browser: [config.BROWSER_NAME, "Chrome", config.BROWSER_VERSION],
        // Removed printQRInTerminal - we handle QR manually
      });

      // Initialize services
      this.messageService = new MessageService(this.sock);
      this.schedulerService = new SchedulerService(
        this.dataService,
        this.messageService
      );
      this.commandManager = new CommandManager(
        this.dataService,
        this.messageService
      );

      this.sock.ev.on("connection.update", (update) => {
        this.handleConnectionUpdate(update);
      });

      this.sock.ev.on("creds.update", saveCreds);

      this.sock.ev.on("messages.upsert", async (m) => {
        await this.handleMessage(m);
      });
    } catch (error) {
      console.error("Error starting bot:", error);
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        const delay = 5000 * this.retryCount;
        console.log(
          `Retrying in ${delay / 1000}s... (${this.retryCount}/${
            this.maxRetries
          })`
        );
        setTimeout(() => this.start(), delay);
      }
    }
  }

  handleConnectionUpdate(update) {
    const { connection, lastDisconnect, qr } = update;

    // Handle QR code display
    if (qr) {
      console.clear();
      console.log("\n========================================");
      console.log("📲  SCAN QR CODE TO LOGIN");
      console.log("========================================\n");
      qrcode.generate(qr, { small: true });
      console.log("\n========================================");
      console.log("Open WhatsApp → Settings → Linked Devices");
      console.log("Tap 'Link a Device' and scan the QR above");
      console.log("========================================\n");
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;

      // Only log important errors (not routine reconnection stuff)
      if (config.DEBUG_MODE) {
        console.log("\n⚠️  Connection closed");
        console.log("Status code:", statusCode);
        console.log("Reason:", lastDisconnect?.error?.message);
      }

      const shouldReconnect =
        lastDisconnect?.error instanceof Boom &&
        statusCode !== DisconnectReason.loggedOut;

      if (shouldReconnect) {
        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          const delay = Math.min(5000 * this.retryCount, 15000);

          if (!config.DEBUG_MODE) {
            // Clean output - just show we're reconnecting
            console.log(
              `\n🔄 Reconnecting... (${this.retryCount}/${this.maxRetries})`
            );
          } else {
            console.log(
              `\nReconnecting in ${delay / 1000}s... (${this.retryCount}/${
                this.maxRetries
              })`
            );
          }

          setTimeout(() => this.start(), delay);
        } else {
          console.error("\n❌ Max reconnection attempts reached.");
          console.error(
            "Please delete 'auth_info_baileys' folder and restart.\n"
          );
          process.exit(1);
        }
      } else {
        console.log("\n🔴 Bot disconnected (logged out or permanent error)");
        process.exit(0);
      }
    } else if (connection === "open") {
      // Reset retry count on successful connection
      this.retryCount = 0;

      console.clear();
      console.log("\n" + "=".repeat(50));
      console.log("🎉  BIRTHDAY BOT IS READY!");
      console.log("=".repeat(50));
      console.log(`\n📱 Owner: ${config.OWNER_NUMBER}`);
      if (config.OWNER_LID) {
        console.log(`🆔 Owner LID: ${config.OWNER_LID}`);
      }
      console.log(`\n💬 Command Prefix: ${config.COMMAND_PREFIX}`);
      console.log(
        `🔒 Security Mode: ${
          config.REQUIRE_WHITELIST
            ? "STRICT (Whitelist Required)"
            : "RELAXED (Setup Mode)"
        }`
      );
      console.log(`\n📚 Send "${config.COMMAND_PREFIX} help" for command list`);
      console.log(
        `🔍 Send "${config.COMMAND_PREFIX} checkid" to check your ID format`
      );

      if (!config.REQUIRE_WHITELIST) {
        console.log(`\n⚠️  WARNING: Security mode is RELAXED!`);
        console.log(`   Anyone can use help/checkid commands.`);
        console.log(
          `   Set REQUIRE_WHITELIST=true in .env for maximum security.`
        );
      }

      console.log("\n" + "=".repeat(50) + "\n");
      console.log("✅ Bot is now listening for messages...\n");
    }
  }

  async handleMessage(messageUpdate) {
    const { messages, type } = messageUpdate;
    if (type !== "notify") return;

    for (const message of messages) {
      if (message.key.remoteJid === "status@broadcast" || !message.message) {
        continue;
      }

      const senderId = message.key.remoteJid;

      // Check if this is the first message from owner and they're using LID
      if (!this.hasShownLIDWarning && this.isOwnerMessage(senderId)) {
        await this.checkAndNotifyLID(senderId);
      }

      if (config.DEBUG_MODE) {
        console.log("📨 Message from:", senderId);
        console.log("   ID Type:", isLID(senderId) ? "LID" : "JID");
      }

      await this.commandManager.processMessage(message);
    }
  }

  isOwnerMessage(jid) {
    const { matchesPhoneNumber } = require("../utils/validators");
    return (
      matchesPhoneNumber(jid, config.OWNER_NUMBER) ||
      (config.OWNER_LID && jid === config.OWNER_LID)
    );
  }

  async checkAndNotifyLID(senderId) {
    // Only check once per bot session
    if (this.hasShownLIDWarning) return;
    this.hasShownLIDWarning = true;

    // Check if owner is using LID format
    if (isLID(senderId)) {
      const phoneNumber = normalizePhoneNumber(senderId);

      // Log to console
      console.log("\n" + "=".repeat(50));
      console.log("ℹ️  LID FORMAT DETECTED");
      console.log("=".repeat(50));
      console.log(`Phone: ${phoneNumber}`);
      console.log(`LID: ${senderId}`);
      console.log("Status: Bot will work correctly using phone matching");
      console.log("\n⚠️  IMPORTANT: Message your OWN number to run commands!");
      console.log("   LID changes per chat, so only use bot in YOUR chat");
      console.log("=".repeat(50) + "\n");

      // Check if LID is already configured
      if (!config.OWNER_LID) {
        // Send helpful notification to user
        const notificationText =
          `👋 *Welcome to Birthday Bot!*\n\n` +
          `🔍 I detected you're using the new WhatsApp LID format.\n\n` +
          `⚠️ *IMPORTANT - Read This:*\n` +
          `Your WhatsApp ID changes per conversation with LID format.\n\n` +
          `✅ *To use bot commands correctly:*\n` +
          `1️⃣ Save your own number as a contact\n` +
          `2️⃣ Open chat with YOUR OWN number\n` +
          `3️⃣ Send commands only in YOUR chat\n` +
          `4️⃣ Don't run commands in other people's chats\n\n` +
          `💡 The bot matches you by phone number (${phoneNumber}), ` +
          `but LID changes per chat, so always use your own chat!\n\n` +
          `📱 *Check your ID:* Send \`${config.COMMAND_PREFIX} checkid\`\n\n` +
          `🎉 You're all set! Use commands in THIS chat.`;

        try {
          await this.messageService.sendMessage(senderId, notificationText);
        } catch (error) {
          console.error("❌ Error sending LID notification:", error.message);
        }
      } else if (config.OWNER_LID !== senderId) {
        console.log(
          "⚠️  Warning: Configured OWNER_LID doesn't match this chat"
        );
        console.log("   Using phone number matching instead\n");
      }
    }
  }

  async shutdown() {
    console.log("\n🔴 Shutting down Birthday Bot...");

    // Create backup before shutdown
    const backupFile = await this.dataService.backupData();
    if (backupFile) {
      console.log(`✅ Backup created: ${backupFile}`);
    }

    console.log("👋 Goodbye!\n");
    process.exit(0);
  }
}

module.exports = WhatsAppBot;
