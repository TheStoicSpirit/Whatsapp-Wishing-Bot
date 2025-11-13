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
const config = require("../../config/config");

class StatusCommand extends BaseCommand {
  async execute(message, args) {
    const senderId = message.key.remoteJid;

    if (!this.isOwner(senderId)) {
      await this.sendMessage(
        senderId,
        "❌ This command is only available to the bot owner."
      );
      return;
    }

    const activeWishes = this.dataService.wishes.filter(
      (w) => !w.archived
    ).length;
    const archivedWishes = this.dataService.wishes.filter(
      (w) => w.archived
    ).length;
    const groupWishes = this.dataService.groupWishes.length;
    const userGroups = Object.keys(this.dataService.userGroups).length;
    const whitelistedUsers = this.dataService.whitelist.length;
    const rawNumber = config.OWNER_NUMBER; // e.g., "919999999999@s.whatsapp.net"

    // Remove "@s.whatsapp.net" and insert dash after country code
    const formattedNumber = rawNumber
      .replace("@s.whatsapp.net", "")
      .replace(/^(\d{2})(\d{10})$/, "$1$2");

    const statusText = `🤖 *Birthday Bot Status*

_Bot Status:_ ${this.dataService.botConfig.active ? "🟢 Active" : "🔴 Inactive"}
_Last Activity:_ ${new Date(
      this.dataService.botConfig.lastActivity
    ).toLocaleString()}

_Statistics:_
📅 Active Wishes: ${activeWishes}
📂 Archived Wishes: ${archivedWishes}
👥 Group Wishes: ${groupWishes}
🏷️ User Groups: ${userGroups}
✅ Whitelisted Users: ${whitelistedUsers}

_Owner No.:_ +${formattedNumber}

_Command Prefix:_ ${config.COMMAND_PREFIX}`;

    await this.sendMessage(senderId, statusText);
  }
}

module.exports = StatusCommand;
