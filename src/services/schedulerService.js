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
const cron = require("node-cron");
const { getCurrentDateTime } = require("../utils/validators");

class SchedulerService {
  constructor(dataService, messageService) {
    this.dataService = dataService;
    this.messageService = messageService;
    this.setupCronJob();
  }

  setupCronJob() {
    // Run every minute to check for scheduled wishes
    cron.schedule("* * * * *", async () => {
      if (this.dataService.botConfig.active) {
        await this.checkAndSendScheduledWishes();
      }
    });
  }

  async checkAndSendScheduledWishes() {
    try {
      const { date: currentDate, time: currentTime } = getCurrentDateTime();

      // Check individual wishes
      const todaysWishes = this.dataService.wishes.filter(
        (wish) => wish.date === currentDate && wish.time === currentTime
      );

      for (const wish of todaysWishes) {
        try {
          const success = await this.messageService.sendMessage(
            wish.jid,
            wish.message
          );
          console.log(`Wish sent to ${wish.jid} (ID: ${wish.id})`);

          // UPDATED: Add send metadata before archiving
          wish.sent_at = new Date().toISOString();
          wish.sent_successfully = success;

          // UPDATED: Move to archive instead of modifying in place
          this.dataService.archiveWish(wish, "sent");

          this.dataService.logActivity({
            type: "wish_sent",
            wish_id: wish.id,
            recipient: wish.jid,
            message: wish.message,
            success: success,
          });
        } catch (error) {
          console.error(`Error sending wish (ID: ${wish.id}):`, error);

          // UPDATED: Archive with error info
          wish.sent_at = new Date().toISOString();
          wish.sent_successfully = false;
          wish.error_message = error.message;

          this.dataService.archiveWish(wish, "send_failed");

          this.dataService.logActivity({
            type: "wish_send_failed",
            wish_id: wish.id,
            recipient: wish.jid,
            error: error.message,
          });
        }
      }

      // Save active wishes (archived ones already removed by archiveWish method)
      if (todaysWishes.length > 0) {
        this.dataService.saveWishes();
      }

      // Check group wishes
      const todaysGroupWishes = this.dataService.groupWishes.filter(
        (wish) => wish.date === currentDate && wish.time === currentTime
      );

      for (const groupWish of todaysGroupWishes) {
        try {
          const group = this.dataService.userGroups[groupWish.groupName];
          if (group && group.members.length > 0) {
            const sentCount = await this.messageService.sendToGroup(
              group.members,
              groupWish.message
            );
            console.log(
              `Group wish sent to ${sentCount}/${group.members.length} members of "${groupWish.groupName}" (ID: ${groupWish.id})`
            );

            // Remove the group wish after sending
            const index = this.dataService.groupWishes.findIndex(
              (w) => w.id === groupWish.id
            );
            if (index > -1) {
              this.dataService.groupWishes.splice(index, 1);
            }

            this.dataService.logActivity({
              type: "group_wish_sent",
              group_wish_id: groupWish.id,
              group: groupWish.groupName,
              sent_count: sentCount,
              total_members: group.members.length,
            });
          }
        } catch (error) {
          console.error(
            `Error sending group wish (ID: ${groupWish.id}):`,
            error
          );
        }
      }

      if (todaysGroupWishes.length > 0) {
        this.dataService.saveGroupWishes();
      }

      // Notify owner if wishes were sent
      const totalSent = todaysWishes.length + todaysGroupWishes.length;
      if (totalSent > 0) {
        await this.messageService.sendMessage(
          require("../config/config").OWNER_NUMBER,
          `🎉 Sent ${totalSent} scheduled wishes at ${currentTime} on ${currentDate}!`
        );
      }
    } catch (error) {
      console.error("Error checking scheduled wishes:", error);
    }
  }
}

module.exports = SchedulerService;
