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
const {
  validateDateFormat,
  validateTimeFormat,
  formatJID,
} = require("../../utils/validators");

class AddWishCommand extends BaseCommand {
  async execute(message, args) {
    const senderId = message.key.remoteJid;

    if (!this.isWhitelisted(senderId)) {
      await this.sendMessage(
        senderId,
        "❌ You are not authorized to use this command."
      );
      return;
    }

    if (args.length < 4) {
      await this.sendMessage(
        senderId,
        `❌ *Usage:* addwish [date] [time] [jid] [message]

*Example:* addwish 25/12/2025 09:00 1234567890@s.whatsapp.net "Merry Christmas! 🎄"

*Date Format:* DD/MM/YYYY (e.g., 25/12/2025)
*Time Format:* HH:MM (e.g., 09:00)`
      );
      return;
    }

    const [date, time, jid, ...messageParts] = args;
    const wishMessage = messageParts.join(" ");

    // Validate date format
    if (!validateDateFormat(date)) {
      await this.sendMessage(
        senderId,
        "❌ Invalid date format. Use DD/MM/YYYY format (e.g., 25/12/2025)"
      );
      return;
    }

    // Validate time format
    if (!validateTimeFormat(time)) {
      await this.sendMessage(
        senderId,
        "❌ Invalid time format. Use HH:MM format (e.g., 09:00)"
      );
      return;
    }

    // Format JID
    const formattedJID = formatJID(jid);

    // Create wish object
    const wish = {
      id: Date.now().toString(),
      date,
      time,
      jid: formattedJID,
      message: wishMessage,
      created_by: senderId,
      created_at: new Date().toISOString(),
      archived: false,
    };

    // Add to wishes array
    this.dataService.wishes.push(wish);

    // Save to file
    if (this.dataService.saveWishes()) {
      await this.sendMessage(
        senderId,
        `✅ *Wish scheduled successfully!*

📅 *Date:* ${date}
⏰ *Time:* ${time}
👤 *Recipient:* ${formattedJID}
💬 *Message:* "${wishMessage}"
🆔 *ID:* ${wish.id}`
      );

      this.dataService.logActivity({
        type: "wish_added",
        wish_id: wish.id,
        created_by: senderId,
        recipient: formattedJID,
        scheduled_for: `${date} ${time}`,
      });
    } else {
      await this.sendMessage(
        senderId,
        "❌ Failed to save wish. Please try again."
      );
    }
  }
}

class DeleteWishCommand extends BaseCommand {
  async execute(message, args) {
    const senderId = message.key.remoteJid;

    if (!this.isWhitelisted(senderId)) {
      await this.sendMessage(
        senderId,
        "❌ You are not authorized to use this command."
      );
      return;
    }

    if (args.length < 1) {
      await this.sendMessage(
        senderId,
        `❌ *Usage:* deletewish [id]

*Example:* deletewish 1234567890`
      );
      return;
    }

    const wishId = args[0];
    const wishIndex = this.dataService.wishes.findIndex((w) => w.id === wishId);

    if (wishIndex === -1) {
      await this.sendMessage(
        senderId,
        "❌ Wish not found with the provided ID."
      );
      return;
    }

    const wish = this.dataService.wishes[wishIndex];

    // Check if user owns the wish or is owner
    if (wish.created_by !== senderId && !this.isOwner(senderId)) {
      await this.sendMessage(
        senderId,
        "❌ You can only delete wishes you created."
      );
      return;
    }

    // Remove wish
    this.dataService.wishes.splice(wishIndex, 1);

    // Save to file
    if (this.dataService.saveWishes()) {
      await this.sendMessage(
        senderId,
        `✅ *Wish deleted successfully!*

🆔 *ID:* ${wishId}
📅 *Was scheduled for:* ${wish.date} ${wish.time}
👤 *Recipient:* ${wish.jid}
💬 *Message:* "${wish.message}"`
      );

      this.dataService.logActivity({
        type: "wish_deleted",
        wish_id: wishId,
        deleted_by: senderId,
      });
    } else {
      await this.sendMessage(
        senderId,
        "❌ Failed to delete wish. Please try again."
      );
    }
  }
}

class ArchiveWishCommand extends BaseCommand {
  async execute(message, args) {
    const senderId = message.key.remoteJid;

    if (!this.isWhitelisted(senderId)) {
      await this.sendMessage(
        senderId,
        "❌ You are not authorized to use this command."
      );
      return;
    }

    if (args.length < 1) {
      await this.sendMessage(
        senderId,
        `❌ *Usage:* archivewish [id]

*Example:* archivewish 1234567890`
      );
      return;
    }

    const wishId = args[0];
    const wish = this.dataService.wishes.find((w) => w.id === wishId);

    if (!wish) {
      await this.sendMessage(
        senderId,
        "❌ Wish not found with the provided ID."
      );
      return;
    }

    // Check if user owns the wish or is owner
    if (wish.created_by !== senderId && !this.isOwner(senderId)) {
      await this.sendMessage(
        senderId,
        "❌ You can only archive wishes you created."
      );
      return;
    }

    // UPDATED: Use new archive method
    const archivedWish = this.dataService.archiveWish(wish, "manual");

    if (archivedWish) {
      await this.sendMessage(
        senderId,
        `✅ *Wish archived successfully!*

🆔 *ID:* ${wishId}
📅 *Was scheduled for:* ${wish.date} ${wish.time}
👤 *Recipient:* ${wish.jid}
💬 *Message:* "${wish.message}"

💡 *Tip:* Use \`listarchives\` to view archived wishes.
Use \`reschedulewish ${wishId} [date] [time]\` to reschedule it.`
      );

      this.dataService.logActivity({
        type: "wish_archived",
        wish_id: wishId,
        archived_by: senderId,
      });
    } else {
      await this.sendMessage(
        senderId,
        "❌ Failed to archive wish. Please try again."
      );
    }
  }
}

class ListWishesCommand extends BaseCommand {
  async execute(message, args) {
    const senderId = message.key.remoteJid;

    if (!this.isWhitelisted(senderId)) {
      await this.sendMessage(
        senderId,
        "❌ You are not authorized to use this command."
      );
      return;
    }

    const isOwner = this.isOwner(senderId);

    // Filter wishes based on user permissions (only active wishes)
    const userWishes = isOwner
      ? this.dataService.wishes
      : this.dataService.wishes.filter((w) => w.created_by === senderId);

    if (userWishes.length === 0) {
      await this.sendMessage(senderId, "📅 No active wishes found.");
      return;
    }

    // Sort wishes by date and time
    userWishes.sort((a, b) => {
      const [dayA, monthA, yearA] = a.date.split("/");
      const [dayB, monthB, yearB] = b.date.split("/");

      const dateA = new Date(`${yearA}-${monthA}-${dayA}T${a.time}`);
      const dateB = new Date(`${yearB}-${monthB}-${dayB}T${b.time}`);
      return dateA - dateB;
    });

    let wishList = `📅 *Active Wishes* (${userWishes.length})\n\n`;

    for (const wish of userWishes) {
      const createdDate = new Date(wish.created_at).toLocaleDateString();
      const [d, m, y] = wish.date.split("/");
      const displayDate = new Date(`${y}-${m}-${d}`).toDateString();

      wishList += `🆔 *ID:* ${wish.id}\n`;
      wishList += `📅 *Date:* ${displayDate}\n`;
      wishList += `⏰ *Time:* ${wish.time}\n`;
      wishList += `👤 *Recipient:* ${wish.jid}\n`;
      wishList += `💬 *Message:* "${wish.message}"\n`;
      wishList += `📝 *Created:* ${createdDate}\n`;

      if (isOwner) {
        wishList += `👨‍💼 *Created by:* ${wish.created_by}\n`;
      }

      wishList += `\n`;
    }

    // Send message, splitting if too long
    await this.sendLongMessage(senderId, wishList);
  }
}

module.exports = {
  AddWishCommand,
  DeleteWishCommand,
  ArchiveWishCommand,
  ListWishesCommand,
};
