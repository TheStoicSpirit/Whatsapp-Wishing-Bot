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
const BaseCommand = require("../baseCommand");
const { formatJID } = require("../../utils/validators");

class StartCommand extends BaseCommand {
  async execute(message, args) {
    const senderId = message.key.remoteJid;

    if (!this.isOwner(senderId)) {
      await this.sendMessage(
        senderId,
        "❌ This command is only available to the bot owner."
      );
      return;
    }

    if (this.dataService.botConfig.active) {
      await this.sendMessage(senderId, "✅ Bot is already active.");
      return;
    }

    this.dataService.botConfig.active = true;
    this.dataService.botConfig.lastActivity = new Date().toISOString();
    this.dataService.botConfig.activated_by = senderId;
    this.dataService.botConfig.activated_at = new Date().toISOString();

    if (this.dataService.saveBotConfig()) {
      await this.sendMessage(
        senderId,
        "🟢 Bot activated successfully!\n\nThe bot will now process commands and send scheduled wishes."
      );

      this.dataService.logActivity({
        type: "bot_activated",
        activated_by: senderId,
      });
    } else {
      await this.sendMessage(
        senderId,
        "❌ Failed to activate bot. Please try again."
      );
    }
  }
}

class StopCommand extends BaseCommand {
  async execute(message, args) {
    const senderId = message.key.remoteJid;

    if (!this.isOwner(senderId)) {
      await this.sendMessage(
        senderId,
        "❌ This command is only available to the bot owner."
      );
      return;
    }

    if (!this.dataService.botConfig.active) {
      await this.sendMessage(senderId, "🔴 Bot is already inactive.");
      return;
    }

    this.dataService.botConfig.active = false;
    this.dataService.botConfig.lastActivity = new Date().toISOString();
    this.dataService.botConfig.deactivated_by = senderId;
    this.dataService.botConfig.deactivated_at = new Date().toISOString();

    if (this.dataService.saveBotConfig()) {
      await this.sendMessage(
        senderId,
        "🔴 Bot deactivated successfully!\n\nThe bot will no longer process commands from non-owner users or send scheduled wishes."
      );

      this.dataService.logActivity({
        type: "bot_deactivated",
        deactivated_by: senderId,
      });
    } else {
      await this.sendMessage(
        senderId,
        "❌ Failed to deactivate bot. Please try again."
      );
    }
  }
}

class WhitelistCommand extends BaseCommand {
  async execute(message, args) {
    const senderId = message.key.remoteJid;

    if (!this.isOwner(senderId)) {
      await this.sendMessage(
        senderId,
        "❌ This command is only available to the bot owner."
      );
      return;
    }

    if (args.length < 2) {
      await this.sendMessage(
        senderId,
        "❌ Usage: whitelist [jid] [name]\n\nExample: whitelist 1234567890@s.whatsapp.net John"
      );
      return;
    }

    const jid = formatJID(args[0]);
    const name = args.slice(1).join(" ");

    if (this.dataService.whitelist.includes(jid)) {
      await this.sendMessage(
        senderId,
        `✅ User ${name} (${jid}) is already whitelisted.`
      );
      return;
    }

    this.dataService.whitelist.push(jid);

    if (this.dataService.saveWhitelist()) {
      await this.sendMessage(
        senderId,
        `✅ User ${name} (${jid}) has been added to the whitelist.`
      );

      this.dataService.logActivity({
        type: "user_whitelisted",
        jid: jid,
        name: name,
        added_by: senderId,
      });
    } else {
      await this.sendMessage(
        senderId,
        "❌ Failed to add user to whitelist. Please try again."
      );
    }
  }
}

class RemoveWhitelistCommand extends BaseCommand {
  async execute(message, args) {
    const senderId = message.key.remoteJid;

    if (!this.isOwner(senderId)) {
      await this.sendMessage(
        senderId,
        "❌ This command is only available to the bot owner."
      );
      return;
    }

    if (args.length < 1) {
      await this.sendMessage(
        senderId,
        "❌ Usage: removewhitelist [jid]\n\nExample: removewhitelist 1234567890@s.whatsapp.net"
      );
      return;
    }

    const jid = formatJID(args[0]);

    if (jid === require("../../config/config").OWNER_NUMBER) {
      await this.sendMessage(
        senderId,
        "❌ Cannot remove the bot owner from the whitelist."
      );
      return;
    }

    const index = this.dataService.whitelist.indexOf(jid);
    if (index === -1) {
      await this.sendMessage(
        senderId,
        `❌ User ${jid} is not in the whitelist.`
      );
      return;
    }

    this.dataService.whitelist.splice(index, 1);

    if (this.dataService.saveWhitelist()) {
      await this.sendMessage(
        senderId,
        `✅ User ${jid} has been removed from the whitelist.`
      );

      this.dataService.logActivity({
        type: "user_removed_from_whitelist",
        jid: jid,
        removed_by: senderId,
      });
    } else {
      await this.sendMessage(
        senderId,
        "❌ Failed to remove user from whitelist. Please try again."
      );
    }
  }
}

class ListWhitelistCommand extends BaseCommand {
  async execute(message, args) {
    const senderId = message.key.remoteJid;

    if (!this.isOwner(senderId)) {
      await this.sendMessage(
        senderId,
        "❌ This command is only available to the bot owner."
      );
      return;
    }

    if (this.dataService.whitelist.length === 0) {
      await this.sendMessage(senderId, "📝 Whitelist is empty.");
      return;
    }

    let whitelistText = "📝 *Whitelisted Users:*\n\n";

    this.dataService.whitelist.forEach((jid, index) => {
      const isOwner = jid === require("../../config/config").OWNER_NUMBER;
      whitelistText += `${index + 1}. ${jid}${isOwner ? " (Owner)" : ""}\n`;
    });

    whitelistText += `\n*Total:* ${this.dataService.whitelist.length} users`;

    await this.sendMessage(senderId, whitelistText);
  }
}

class BackupCommand extends BaseCommand {
  async execute(message, args) {
    const senderId = message.key.remoteJid;

    if (!this.isOwner(senderId)) {
      await this.sendMessage(
        senderId,
        "❌ This command is only available to the bot owner."
      );
      return;
    }

    await this.sendMessage(senderId, "🔄 Creating backup...");

    const backupFileName = await this.dataService.backupData();

    if (backupFileName) {
      await this.sendMessage(
        senderId,
        `✅ Backup created successfully!\n\nBackup file: ${backupFileName}\n\nThis backup contains all wishes, groups, and configuration data.`
      );

      this.dataService.logActivity({
        type: "backup_created",
        backup_file: backupFileName,
        created_by: senderId,
      });
    } else {
      await this.sendMessage(
        senderId,
        "❌ Failed to create backup. Please try again."
      );
    }
  }
}

class RestoreCommand extends BaseCommand {
  async execute(message, args) {
    const senderId = message.key.remoteJid;

    if (!this.isOwner(senderId)) {
      await this.sendMessage(
        senderId,
        "❌ This command is only available to the bot owner."
      );
      return;
    }

    if (args.length < 1) {
      await this.sendMessage(
        senderId,
        "❌ Usage: restore [backup_filename]\n\nExample: restore backup_1234567890.json"
      );
      return;
    }

    const backupFileName = args[0];

    await this.sendMessage(
      senderId,
      `🔄 Restoring data from backup: ${backupFileName}...`
    );

    const success = await this.dataService.restoreData(backupFileName);

    if (success) {
      await this.sendMessage(
        senderId,
        `✅ Data restored successfully from backup: ${backupFileName}\n\nAll wishes, groups, and configuration have been restored.`
      );

      this.dataService.logActivity({
        type: "data_restored",
        backup_file: backupFileName,
        restored_by: senderId,
      });
    } else {
      await this.sendMessage(
        senderId,
        `❌ Failed to restore data from backup: ${backupFileName}\n\nPlease check if the backup file exists and is valid.`
      );
    }
  }
}

class ClearLogsCommand extends BaseCommand {
  async execute(message, args) {
    const senderId = message.key.remoteJid;

    if (!this.isOwner(senderId)) {
      await this.sendMessage(
        senderId,
        "❌ This command is only available to the bot owner."
      );
      return;
    }

    const config = require("../../config/config");
    const FileManager = require("../../utils/fileManager");

    const currentLogCount = FileManager.loadJSON(config.LOG_FILE, []).length;

    if (FileManager.saveJSON(config.LOG_FILE, [])) {
      await this.sendMessage(
        senderId,
        `✅ Activity logs cleared successfully!\n\nCleared ${currentLogCount} log entries.`
      );

      this.dataService.logActivity({
        type: "logs_cleared",
        cleared_count: currentLogCount,
        cleared_by: senderId,
      });
    } else {
      await this.sendMessage(
        senderId,
        "❌ Failed to clear logs. Please try again."
      );
    }
  }
}

class ArchiveOldWishesCommand extends BaseCommand {
  async execute(message, args) {
    const senderId = message.key.remoteJid;

    if (!this.isOwner(senderId)) {
      await this.sendMessage(
        senderId,
        "❌ This command is only available to the bot owner."
      );
      return;
    }

    const { getCurrentDateTime } = require("../../utils/validators");
    const { date: currentDate } = getCurrentDateTime();

    let archivedCount = 0;
    const currentDateObj = new Date();

    for (const wish of this.dataService.wishes) {
      if (!wish.archived) {
        // Parse wish date (DD/MM format)
        const [day, month] = wish.date.split("/").map(Number);
        const wishDate = new Date(currentDateObj.getFullYear(), month - 1, day);

        // If wish date is in the past, archive it
        if (wishDate < currentDateObj) {
          wish.archived = true;
          wish.archived_at = new Date().toISOString();
          wish.archived_reason = "auto_archived_past_date";
          archivedCount++;
        }
      }
    }

    if (archivedCount > 0) {
      if (this.dataService.saveWishes()) {
        await this.sendMessage(
          senderId,
          `✅ Archived ${archivedCount} old wishes that have passed their scheduled date.`
        );

        this.dataService.logActivity({
          type: "old_wishes_archived",
          archived_count: archivedCount,
          archived_by: senderId,
        });
      } else {
        await this.sendMessage(
          senderId,
          "❌ Failed to archive old wishes. Please try again."
        );
      }
    } else {
      await this.sendMessage(senderId, "✅ No old wishes found to archive.");
    }
  }
}

module.exports = {
  StartCommand,
  StopCommand,
  WhitelistCommand,
  RemoveWhitelistCommand,
  ListWhitelistCommand,
  BackupCommand,
  RestoreCommand,
  ClearLogsCommand,
  ArchiveOldWishesCommand,
};
