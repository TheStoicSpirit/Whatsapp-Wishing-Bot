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

// Archive Commands - NEW
const {
  ListArchivedWishesCommand,
  RescheduleArchivedWishCommand,
  DeleteArchivedWishCommand,
  ClearArchivedWishesCommand,
} = require("./implementations/archiveCommands");

class CommandManager {
  constructor(dataService, messageService) {
    this.dataService = dataService;
    this.messageService = messageService;
    this.commandParser = new CommandParser();
    this.commands = new Map();

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

    // Archive Management Commands - NEW
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

      const command = this.commands.get(parsedCommand.command);
      if (!command) {
        await this.messageService.sendMessage(
          senderId,
          `❌ Unknown command: ${parsedCommand.command}\n\nType "help" for available commands.`
        );
        return;
      }

      // Update last activity
      this.dataService.botConfig.lastActivity = new Date().toISOString();
      this.dataService.saveBotConfig();

      // Execute command
      await command.execute(message, parsedCommand.args);
    } catch (error) {
      console.error("Error processing message:", error);

      // Send error message to user
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

  extractMessageText(message) {
    return (
      message.message?.conversation ||
      message.message?.extendedTextMessage?.text ||
      ""
    ).trim();
  }

  isOwner(jid) {
    const config = require("../config/config");
    return jid === config.OWNER_NUMBER;
  }
}

module.exports = CommandManager;
