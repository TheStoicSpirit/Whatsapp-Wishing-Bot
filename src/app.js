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

const WhatsAppBot = require("./bot/whatsAppBot");

// Create and start the bot
const bot = new WhatsAppBot();

// Graceful shutdown handlers
process.on("SIGINT", async () => {
  await bot.shutdown();
});

process.on("uncaughtException", async (error) => {
  console.error("Uncaught Exception:", error);
  await bot.dataService.backupData();
  process.exit(1);
});

process.on("unhandledRejection", async (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  await bot.dataService.backupData();
  process.exit(1);
});

console.log("Birthday Bot starting...");
