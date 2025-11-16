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
require("dotenv").config();
const path = require("path");

module.exports = {
  // Bot configuration
  OWNER_NUMBER: process.env.OWNER_NUMBER,
  OWNER_LID: process.env.OWNER_LID || null, // NEW - Optional LID for newer WhatsApp accounts
  COMMAND_PREFIX: process.env.COMMAND_PREFIX || "Bot,",
  DEBUG_MODE: process.env.DEBUG_MODE === "true",

  // Security configuration - NEW
  REQUIRE_WHITELIST: process.env.REQUIRE_WHITELIST !== "false", // Default: true (secure)

  // Logging configuration
  LOGGING_MODE: process.env.LOGGING_MODE || "file", // "file", "console", "disabled"

  // File paths
  WISHES_FILE: path.join(__dirname, "../data/wishes.json"),
  ARCHIVED_WISHES_FILE: path.join(__dirname, "../data/archived_wishes.json"),
  GROUP_WISHES_FILE: path.join(__dirname, "../data/group_wishes.json"),
  USER_GROUPS_FILE: path.join(__dirname, "../data/user_groups.json"),
  WHITELIST_FILE: path.join(__dirname, "../data/whitelist.json"),
  BOT_CONFIG_FILE: path.join(__dirname, "../data/bot_config.json"),
  LOG_FILE: path.join(__dirname, "../data/bot_log.json"),

  // Auth configuration
  AUTH_STATE_DIR: process.env.AUTH_STATE_DIR || "./auth_info_baileys",
  LOG_FILE_PATH: process.env.LOG_FILE || "./wa-logs.txt",

  // Browser configuration
  BROWSER_NAME: process.env.BAILEYS_BROWSER_NAME || "Birthday Bot",
  BROWSER_VERSION: process.env.BAILEYS_BROWSER_VERSION || "1.0.0",
};
