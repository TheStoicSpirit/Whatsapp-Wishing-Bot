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
} = require("../../utils/validators");

class ListArchivedWishesCommand extends BaseCommand {
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

    // Filter based on permissions
    const userArchives = isOwner
      ? this.dataService.archivedWishes
      : this.dataService.archivedWishes.filter(
          (w) => w.created_by === senderId
        );

    if (userArchives.length === 0) {
      await this.sendMessage(senderId, "📦 No archived wishes found.");
      return;
    }

    // Sort by archived date (newest first)
    userArchives.sort(
      (a, b) => new Date(b.archived_at) - new Date(a.archived_at)
    );

    // Option to filter by reason
    const filterReason = args[0]?.toLowerCase(); // sent, manual, expired, send_failed
    const filtered = filterReason
      ? userArchives.filter((w) => w.archived_reason === filterReason)
      : userArchives;

    if (filtered.length === 0) {
      await this.sendMessage(
        senderId,
        `📦 No archived wishes found with reason: ${filterReason}`
      );
      return;
    }

    let archiveList = `📦 *Archived Wishes* (${filtered.length})\n\n`;

    // Show only recent 20 to avoid message length issues
    const displayWishes = filtered.slice(0, 20);

    for (const wish of displayWishes) {
      const archivedDate = new Date(wish.archived_at).toLocaleString();
      const sentStatus = wish.sent_successfully ? "✅ Sent" : "❌ Failed";

      archiveList += `🆔 *ID:* ${wish.id}\n`;
      archiveList += `📅 *Original Date:* ${wish.date} ${wish.time}\n`;
      archiveList += `👤 *Recipient:* ${wish.jid}\n`;
      archiveList += `💬 *Message:* "${wish.message}"\n`;
      archiveList += `📦 *Archived:* ${archivedDate}\n`;
      archiveList += `📌 *Reason:* ${wish.archived_reason}\n`;

      if (wish.sent_at) {
        archiveList += `📤 *Status:* ${sentStatus}\n`;
      }

      if (wish.error_message) {
        archiveList += `⚠️ *Error:* ${wish.error_message}\n`;
      }

      if (isOwner) {
        archiveList += `👨‍💼 *Created by:* ${wish.created_by}\n`;
      }

      archiveList += `\n`;
    }

    if (filtered.length > 20) {
      archiveList += `\n_Showing 20 of ${filtered.length} archived wishes_\n`;
      archiveList += `_Filters available: sent, manual, expired, send_failed_`;
    }

    await this.sendLongMessage(senderId, archiveList);
  }
}

class RescheduleArchivedWishCommand extends BaseCommand {
  async execute(message, args) {
    const senderId = message.key.remoteJid;

    if (!this.isWhitelisted(senderId)) {
      await this.sendMessage(
        senderId,
        "❌ You are not authorized to use this command."
      );
      return;
    }

    if (args.length < 3) {
      await this.sendMessage(
        senderId,
        `❌ *Usage:* reschedulewish [archived_id] [new_date] [new_time]

*Example:* reschedulewish 1234567890 25/12/2025 09:00

This will create a new active wish from an archived one.`
      );
      return;
    }

    const [wishId, newDate, newTime] = args;

    // Validate formats
    if (!validateDateFormat(newDate)) {
      await this.sendMessage(
        senderId,
        "❌ Invalid date format. Use DD/MM/YYYY"
      );
      return;
    }

    if (!validateTimeFormat(newTime)) {
      await this.sendMessage(senderId, "❌ Invalid time format. Use HH:MM");
      return;
    }

    // Find archived wish
    const archivedWish = this.dataService.archivedWishes.find(
      (w) => w.id === wishId
    );

    if (!archivedWish) {
      await this.sendMessage(
        senderId,
        "❌ Archived wish not found with the provided ID."
      );
      return;
    }

    // Check permissions
    if (archivedWish.created_by !== senderId && !this.isOwner(senderId)) {
      await this.sendMessage(
        senderId,
        "❌ You can only reschedule wishes you created."
      );
      return;
    }

    // Reschedule
    const newWish = this.dataService.unarchiveWish(wishId, newDate, newTime);

    if (newWish) {
      await this.sendMessage(
        senderId,
        `✅ *Wish rescheduled successfully!*

📦 *Original ID:* ${wishId}
🆔 *New ID:* ${newWish.id}
📅 *New Date:* ${newDate}
⏰ *New Time:* ${newTime}
👤 *Recipient:* ${newWish.jid}
💬 *Message:* "${newWish.message}"

The wish has been reactivated and will be sent at the new scheduled time.`
      );

      this.dataService.logActivity({
        type: "wish_rescheduled",
        original_wish_id: wishId,
        new_wish_id: newWish.id,
        rescheduled_by: senderId,
        new_schedule: `${newDate} ${newTime}`,
      });
    } else {
      await this.sendMessage(
        senderId,
        "❌ Failed to reschedule wish. Please try again."
      );
    }
  }
}

class DeleteArchivedWishCommand extends BaseCommand {
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
        `❌ *Usage:* deletearchivedwish [id]

*Example:* deletearchivedwish 1234567890

This will permanently delete the archived wish.`
      );
      return;
    }

    const wishId = args[0];
    const archivedWish = this.dataService.archivedWishes.find(
      (w) => w.id === wishId
    );

    if (!archivedWish) {
      await this.sendMessage(
        senderId,
        "❌ Archived wish not found with the provided ID."
      );
      return;
    }

    // Check permissions
    if (archivedWish.created_by !== senderId && !this.isOwner(senderId)) {
      await this.sendMessage(
        senderId,
        "❌ You can only delete wishes you created."
      );
      return;
    }

    // Delete
    if (this.dataService.deleteArchivedWish(wishId)) {
      await this.sendMessage(
        senderId,
        `✅ *Archived wish deleted permanently!*

🆔 *ID:* ${wishId}
📅 *Was scheduled for:* ${archivedWish.date} ${archivedWish.time}
👤 *Recipient:* ${archivedWish.jid}
💬 *Message:* "${archivedWish.message}"`
      );

      this.dataService.logActivity({
        type: "archived_wish_deleted",
        wish_id: wishId,
        deleted_by: senderId,
      });
    } else {
      await this.sendMessage(
        senderId,
        "❌ Failed to delete archived wish. Please try again."
      );
    }
  }
}

class ClearArchivedWishesCommand extends BaseCommand {
  async execute(message, args) {
    const senderId = message.key.remoteJid;

    if (!this.isOwner(senderId)) {
      await this.sendMessage(
        senderId,
        "❌ This command is only available to the bot owner."
      );
      return;
    }

    const count = this.dataService.archivedWishes.length;

    if (count === 0) {
      await this.sendMessage(senderId, "📦 Archive is already empty.");
      return;
    }

    // Optional: Keep last N archives
    const keepLast = args[0] ? parseInt(args[0]) : 0;

    if (keepLast > 0) {
      // Sort by date and keep most recent
      this.dataService.archivedWishes.sort(
        (a, b) => new Date(b.archived_at) - new Date(a.archived_at)
      );
      this.dataService.archivedWishes = this.dataService.archivedWishes.slice(
        0,
        keepLast
      );

      await this.sendMessage(
        senderId,
        `✅ Cleared old archives! Kept most recent ${keepLast} wishes.\n\n📊 *Deleted:* ${
          count - keepLast
        } archived wishes`
      );
    } else {
      // Clear all
      this.dataService.archivedWishes = [];

      await this.sendMessage(
        senderId,
        `✅ All archived wishes cleared!\n\n📊 *Deleted:* ${count} archived wishes`
      );
    }

    this.dataService.saveArchivedWishes();

    this.dataService.logActivity({
      type: "archives_cleared",
      cleared_count: count,
      kept_count: keepLast,
      cleared_by: senderId,
    });
  }
}

module.exports = {
  ListArchivedWishesCommand,
  RescheduleArchivedWishCommand,
  DeleteArchivedWishCommand,
  ClearArchivedWishesCommand,
};
