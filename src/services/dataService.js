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
const FileManager = require("../utils/fileManager");
const config = require("../config/config");
const path = require("path");

class DataService {
  constructor() {
    this.wishes = this.loadWishes();
    this.archivedWishes = this.loadArchivedWishes(); // NEW
    this.groupWishes = this.loadGroupWishes();
    this.userGroups = this.loadUserGroups();
    this.whitelist = this.loadWhitelist();
    this.botConfig = this.loadBotConfig();
  }

  // Load methods
  loadWishes() {
    return FileManager.loadJSON(config.WISHES_FILE, []);
  }

  // NEW METHOD
  loadArchivedWishes() {
    return FileManager.loadJSON(config.ARCHIVED_WISHES_FILE, []);
  }

  loadGroupWishes() {
    return FileManager.loadJSON(config.GROUP_WISHES_FILE, []);
  }

  loadUserGroups() {
    return FileManager.loadJSON(config.USER_GROUPS_FILE, {});
  }

  loadWhitelist() {
    return FileManager.loadJSON(config.WHITELIST_FILE, [config.OWNER_NUMBER]);
  }

  loadBotConfig() {
    return FileManager.loadJSON(config.BOT_CONFIG_FILE, {
      active: true,
      lastActivity: new Date().toISOString(),
    });
  }

  // Save methods
  saveWishes() {
    return FileManager.saveJSON(config.WISHES_FILE, this.wishes);
  }

  // NEW METHOD
  saveArchivedWishes() {
    return FileManager.saveJSON(
      config.ARCHIVED_WISHES_FILE,
      this.archivedWishes
    );
  }

  saveGroupWishes() {
    return FileManager.saveJSON(config.GROUP_WISHES_FILE, this.groupWishes);
  }

  saveUserGroups() {
    return FileManager.saveJSON(config.USER_GROUPS_FILE, this.userGroups);
  }

  saveWhitelist() {
    return FileManager.saveJSON(config.WHITELIST_FILE, this.whitelist);
  }

  saveBotConfig() {
    return FileManager.saveJSON(config.BOT_CONFIG_FILE, this.botConfig);
  }

  // NEW METHOD - Move wish to archive
  archiveWish(wish, reason = "manual") {
    const archivedWish = {
      ...wish,
      archived_at: new Date().toISOString(),
      archived_reason: reason,
    };

    // Add to archived wishes
    this.archivedWishes.push(archivedWish);

    // Remove from active wishes
    const index = this.wishes.findIndex((w) => w.id === wish.id);
    if (index > -1) {
      this.wishes.splice(index, 1);
    }

    // Save both files
    this.saveWishes();
    this.saveArchivedWishes();

    return archivedWish;
  }

  // NEW METHOD - Move wish back to active
  unarchiveWish(wishId, newDate, newTime) {
    const index = this.archivedWishes.findIndex((w) => w.id === wishId);
    if (index === -1) return null;

    const wish = this.archivedWishes[index];

    // Create reactivated wish
    const reactivatedWish = {
      id: Date.now().toString(), // New ID
      date: newDate,
      time: newTime,
      jid: wish.jid,
      message: wish.message,
      created_by: wish.created_by,
      created_at: new Date().toISOString(),
      rescheduled_from: wish.id,
      archived: false,
    };

    // Add to active wishes
    this.wishes.push(reactivatedWish);

    // Keep original in archive (for history)
    // If you want to remove it: this.archivedWishes.splice(index, 1);

    // Save both
    this.saveWishes();
    this.saveArchivedWishes();

    return reactivatedWish;
  }

  // NEW METHOD - Delete archived wish permanently
  deleteArchivedWish(wishId) {
    const index = this.archivedWishes.findIndex((w) => w.id === wishId);
    if (index === -1) return false;

    this.archivedWishes.splice(index, 1);
    return this.saveArchivedWishes();
  }

  // Activity logging
  logActivity(activityData) {
    try {
      let logs = FileManager.loadJSON(config.LOG_FILE, []);
      logs.push({
        timestamp: new Date().toISOString(),
        ...activityData,
      });
      // Keep only last 1000 logs
      if (logs.length > 1000) {
        logs = logs.slice(-1000);
      }
      FileManager.saveJSON(config.LOG_FILE, logs);
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  }

  // UPDATED - Backup and restore
  async backupData() {
    try {
      const backupData = {
        wishes: this.wishes,
        archivedWishes: this.archivedWishes, // ADDED
        groupWishes: this.groupWishes,
        userGroups: this.userGroups,
        whitelist: this.whitelist,
        botConfig: this.botConfig,
        backup_date: new Date().toISOString(),
      };

      // Create readable date string
      const now = new Date();
      const formattedDate = now
        .toISOString()
        .replace(/T/, "_") // Replace T with underscore
        .replace(/:/g, "-") // Replace colons with hyphens
        .replace(/\..+/, ""); // Remove milliseconds and Z

      const backupFileName = `backup_${formattedDate}.json`;
      const backupDir = path.join(__dirname, "../backups");
      FileManager.ensureDirectoryExists(backupDir);

      const backupPath = path.join(backupDir, backupFileName);

      if (FileManager.saveJSON(backupPath, backupData)) {
        console.log(`Backup created: ${backupFileName}`);
        return backupFileName;
      }
      return null;
    } catch (error) {
      console.error("Error creating backup:", error);
      return null;
    }
  }

  // UPDATED
  async restoreData(backupFileName) {
    try {
      const backupPath = path.join(__dirname, "../backups", backupFileName);
      const backupData = FileManager.loadJSON(backupPath);

      if (!backupData) {
        throw new Error("Backup file not found or invalid");
      }

      this.wishes = backupData.wishes || [];
      this.archivedWishes = backupData.archivedWishes || []; // ADDED
      this.groupWishes = backupData.groupWishes || [];
      this.userGroups = backupData.userGroups || {};
      this.whitelist = backupData.whitelist || [config.OWNER_NUMBER];
      this.botConfig = backupData.botConfig || {
        active: true,
        lastActivity: new Date().toISOString(),
      };

      // Save restored data
      this.saveWishes();
      this.saveArchivedWishes(); // ADDED
      this.saveGroupWishes();
      this.saveUserGroups();
      this.saveWhitelist();
      this.saveBotConfig();

      console.log(`Data restored from backup: ${backupFileName}`);
      return true;
    } catch (error) {
      console.error("Error restoring backup:", error);
      return false;
    }
  }
}

module.exports = DataService;
