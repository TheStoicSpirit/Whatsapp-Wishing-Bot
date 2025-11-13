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
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const qrcode = require("qrcode-terminal");
const config = require("../config/config");
const logger = require("../utils/logger");
const DataService = require("../services/dataService");
const MessageService = require("../services/messageService");
const SchedulerService = require("../services/schedulerService");
const CommandManager = require("../commands/commandManager");

class WhatsAppBot {
  constructor() {
    this.sock = null;
    this.dataService = new DataService();
    this.messageService = null;
    this.schedulerService = null;
    this.commandManager = null;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.start();
  }

  async start() {
    try {
      const { state, saveCreds } = await useMultiFileAuthState(
        config.AUTH_STATE_DIR
      );

      // Fetch latest version info
      const { version, isLatest } = await fetchLatestBaileysVersion();
      console.log(
        `Using WA version v${version.join(".")}, isLatest: ${isLatest}`
      );

      this.sock = makeWASocket({
        auth: state,
        logger,
        printQRInTerminal: true,
        browser: [config.BROWSER_NAME, "Chrome", config.BROWSER_VERSION],
        version, // Use fetched version
        defaultQueryTimeoutMs: undefined,
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
      console.error("Error in start():", error);
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        const delay = Math.min(5000 * this.retryCount, 15000);
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

    if (qr) {
      console.clear();
      console.log("📲 Scan the QR code below to log in:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const errorData = lastDisconnect?.error?.data;

      console.log("Connection closed:");
      console.log("  Status code:", statusCode);
      console.log("  Error data:", errorData);
      console.log("  Full error:", lastDisconnect?.error);

      // Check if it's a Boom error and not logged out
      const shouldReconnect =
        lastDisconnect?.error instanceof Boom &&
        statusCode !== DisconnectReason.loggedOut;

      console.log("  Should reconnect:", shouldReconnect);

      if (shouldReconnect) {
        // Special handling for 405 errors
        if (statusCode === 405) {
          console.log("\n⚠️  405 Error Detected!");
          console.log("This usually means:");
          console.log("  1. Your auth session is corrupted/outdated");
          console.log("  2. WhatsApp updated their protocol");
          console.log("\n✅ Solutions:");
          console.log("  1. Delete the 'auth_info_baileys' folder");
          console.log(
            "  2. Update to: npm install @whiskeysockets/baileys@7.0.0-rc.6"
          );
          console.log("  3. Restart the bot and scan QR code again\n");

          // Don't auto-reconnect on 405, user needs to fix it
          process.exit(1);
        }

        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          const delay = Math.min(5000 * Math.pow(2, this.retryCount), 30000);
          console.log(
            `Reconnecting in ${delay / 1000}s... (${this.retryCount}/${
              this.maxRetries
            })`
          );
          setTimeout(() => this.start(), delay);
        } else {
          console.error("Max reconnection attempts reached. Exiting...");
          process.exit(1);
        }
      } else {
        console.log("Logged out or permanent error. Not reconnecting.");
        process.exit(0);
      }
    } else if (connection === "open") {
      this.retryCount = 0; // Reset retry count on successful connection
      console.log("🎉 Birthday Bot is ready!");
      console.log("Owner number configured as:", config.OWNER_NUMBER);
      console.log(
        `Send "${config.COMMAND_PREFIX} help" to see available commands`
      );
    }
  }

  async handleMessage(messageUpdate) {
    const { messages, type } = messageUpdate;
    if (type !== "notify") return;

    for (const message of messages) {
      if (message.key.remoteJid === "status@broadcast" || !message.message) {
        continue;
      }

      if (config.DEBUG_MODE) {
        console.log("Processing message from:", message.key.remoteJid);
      }

      await this.commandManager.processMessage(message);
    }
  }

  async shutdown() {
    console.log("Shutting down bot...");
    // Create backup before shutdown
    const backupFile = await this.dataService.backupData();
    if (backupFile) {
      console.log(`Backup created before shutdown: ${backupFile}`);
    }
    process.exit(0);
  }
}

module.exports = WhatsAppBot;
