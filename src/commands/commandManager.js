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
const CommandParser = require("./commandParser");
const config = require("../config/config");
const { matchesPhoneNumber } = require("../utils/validators");

// Import all command implementations
const HelpCommand = require("./implementations/helpCommand");
const StatusCommand = require("./implementations/statusCommand");

// Wish Commands
const {
  AddWishCommand,
  DeleteWishCommand,
  ArchiveWishCommand,
  ListWishesCommand,
} = require("./implementations/wishCommands");

// Group Commands
const {
  CreateGroupCommand,
  AddToGroupCommand,
  RemoveFromGroupCommand,
  ListGroupsCommand,
  ListGroupMembersCommand,
  AddGroupWishCommand,
  ListGroupWishesCommand,
  SendGroupWishNowCommand,
} = require("./implementations/groupCommands");

// Admin Commands
const {
  StartCommand,
  StopCommand,
  WhitelistCommand,
  RemoveWhitelistCommand,
  ListWhitelistCommand,
  BackupCommand,
  RestoreCommand,
  ClearLogsCommand,
  ArchiveOldWishesCommand,
} = require("./implementations/adminCommands");

// Archive Commands
const {
  ListArchivedWishesCommand,
  RescheduleArchivedWishCommand,
  DeleteArchivedWishCommand,
  ClearArchivedWishesCommand,
} = require("./implementations/archiveCommands");

// Utility Commands
const CheckIdCommand = require("./implementations/checkIdCommand");

class CommandManager {
  constructor(dataService, messageService) {
    this.dataService = dataService;
    this.messageService = messageService;
    this.commandParser = new CommandParser();
    this.commands = new Map();

    // Commands that don't require whitelist (when REQUIRE_WHITELIST=false)
    this.publicCommands = new Set(["help", "checkid"]);

    this.registerCommands();
  }

  registerCommands() {
    // General Commands
    this.commands.set(
      "help",
      new HelpCommand(this.dataService, this.messageService)
    );
    this.commands.set(
      "status",
      new StatusCommand(this.dataService, this.messageService)
    );
    this.commands.set(
      "checkid",
      new CheckIdCommand(this.dataService, this.messageService)
    );

    // Wish Management Commands
    this.commands.set(
      "addwish",
      new AddWishCommand(this.dataService, this.messageService)
    );
    this.commands.set(
      "deletewish",
      new DeleteWishCommand(this.dataService, this.messageService)
    );
    this.commands.set(
      "archivewish",
      new ArchiveWishCommand(this.dataService, this.messageService)
    );
    this.commands.set(
      "listwishes",
      new ListWishesCommand(this.dataService, this.messageService)
    );

    // Archive Management Commands
    this.commands.set(
      "listarchives",
      new ListArchivedWishesCommand(this.dataService, this.messageService)
    );
    this.commands.set(
      "reschedulewish",
      new RescheduleArchivedWishCommand(this.dataService, this.messageService)
    );
    this.commands.set(
      "deletearchivedwish",
      new DeleteArchivedWishCommand(this.dataService, this.messageService)
    );
    this.commands.set(
      "cleararchives",
      new ClearArchivedWishesCommand(this.dataService, this.messageService)
    );

    // Group Management Commands
    this.commands.set(
      "creategroup",
      new CreateGroupCommand(this.dataService, this.messageService)
    );
    this.commands.set(
      "addtogroup",
      new AddToGroupCommand(this.dataService, this.messageService)
    );
    this.commands.set(
      "removefromgroup",
      new RemoveFromGroupCommand(this.dataService, this.messageService)
    );
    this.commands.set(
      "listgroups",
      new ListGroupsCommand(this.dataService, this.messageService)
    );
    this.commands.set(
      "listgroupmembers",
      new ListGroupMembersCommand(this.dataService, this.messageService)
    );

    // Group Wish Commands
    this.commands.set(
      "addgroupwish",
      new AddGroupWishCommand(this.dataService, this.messageService)
    );
    this.commands.set(
      "listgroupwishes",
      new ListGroupWishesCommand(this.dataService, this.messageService)
    );
    this.commands.set(
      "sendgroupwishnow",
      new SendGroupWishNowCommand(this.dataService, this.messageService)
    );

    // Admin/Owner Commands
    this.commands.set(
      "start",
      new StartCommand(this.dataService, this.messageService)
    );
    this.commands.set(
      "stop",
      new StopCommand(this.dataService, this.messageService)
    );
    this.commands.set(
      "whitelist",
      new WhitelistCommand(this.dataService, this.messageService)
    );
    this.commands.set(
      "removewhitelist",
      new RemoveWhitelistCommand(this.dataService, this.messageService)
    );
    this.commands.set(
      "listwhitelist",
      new ListWhitelistCommand(this.dataService, this.messageService)
    );
    this.commands.set(
      "backup",
      new BackupCommand(this.dataService, this.messageService)
    );
    this.commands.set(
      "restore",
      new RestoreCommand(this.dataService, this.messageService)
    );
    this.commands.set(
      "clearlogs",
      new ClearLogsCommand(this.dataService, this.messageService)
    );
    this.commands.set(
      "archiveoldwishes",
      new ArchiveOldWishesCommand(this.dataService, this.messageService)
    );
  }

  async processMessage(message) {
    try {
      const senderId = message.key.remoteJid;

      // Check if bot is active (except for owner)
      if (!this.dataService.botConfig.active && !this.isOwner(senderId)) {
        return; // Silently ignore messages when bot is inactive
      }

      const messageText = this.extractMessageText(message);
      if (!messageText) return;

      const parsedCommand = this.commandParser.parse(messageText);
      if (!parsedCommand) return;

      const commandName = parsedCommand.command;
      const command = this.commands.get(commandName);

      if (!command) {
        // Unknown command - check whitelist before responding
        if (this.isWhitelisted(senderId)) {
          await this.messageService.sendMessage(
            senderId,
            `❌ Unknown command: ${commandName}\n\nType "${config.COMMAND_PREFIX} help" for available commands.`
          );
        }
        // Silently ignore for non-whitelisted users
        return;
      }

      // Security Check: REQUIRE_WHITELIST mode
      if (config.REQUIRE_WHITELIST) {
        // Strict mode: ALL commands require whitelist
        if (!this.isWhitelisted(senderId)) {
          if (config.DEBUG_MODE) {
            console.log(
              `🔒 Blocked command "${commandName}" from non-whitelisted user: ${senderId}`
            );
          }
          // Silently ignore - don't reveal bot exists
          return;
        }
      } else {
        // Relaxed mode: Only public commands allowed without whitelist
        if (
          !this.publicCommands.has(commandName) &&
          !this.isWhitelisted(senderId)
        ) {
          if (config.DEBUG_MODE) {
            console.log(
              `🔒 Blocked command "${commandName}" from non-whitelisted user: ${senderId}`
            );
          }
          // Send helpful message for setup commands
          await this.messageService.sendMessage(
            senderId,
            `🔒 This command requires authorization.\n\n` +
              `You can use:\n` +
              `• ${config.COMMAND_PREFIX} help - View available commands\n` +
              `• ${config.COMMAND_PREFIX} checkid - Check your WhatsApp ID\n\n` +
              `To use other commands, contact the bot owner.`
          );
          return;
        }
      }

      // Update last activity
      this.dataService.botConfig.lastActivity = new Date().toISOString();
      this.dataService.saveBotConfig();

      // Execute command
      await command.execute(message, parsedCommand.args);

      if (config.DEBUG_MODE) {
        console.log(`✅ Executed command "${commandName}" for: ${senderId}`);
      }
    } catch (error) {
      console.error("Error processing message:", error);

      // Only send error to whitelisted users
      if (this.isWhitelisted(message.key.remoteJid)) {
        try {
          await this.messageService.sendMessage(
            message.key.remoteJid,
            "❌ An error occurred while processing your command. Please try again."
          );
        } catch (sendError) {
          console.error("Error sending error message:", sendError);
        }
      }
    }
  }

  extractMessageText(message) {
    return (
      message.message?.conversation ||
      message.message?.extendedTextMessage?.text ||
      ""
    ).trim();
  }

  isOwner(jid) {
    return (
      matchesPhoneNumber(jid, config.OWNER_NUMBER) ||
      (config.OWNER_LID && jid === config.OWNER_LID)
    );
  }

  isWhitelisted(jid) {
    // Owner is always whitelisted
    if (this.isOwner(jid)) return true;

    // Check whitelist using phone number matching
    const { normalizePhoneNumber } = require("../utils/validators");
    const senderPhone = normalizePhoneNumber(jid);

    return this.dataService.whitelist.some((whitelistedJid) => {
      const whitelistedPhone = normalizePhoneNumber(whitelistedJid);
      return senderPhone === whitelistedPhone && senderPhone !== "";
    });
  }
}

module.exports = CommandManager;
