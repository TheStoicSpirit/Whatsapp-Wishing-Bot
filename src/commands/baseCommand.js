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
const config = require("../config/config");
const {
  matchesPhoneNumber,
  normalizePhoneNumber,
} = require("../utils/validators");

class BaseCommand {
  constructor(dataService, messageService) {
    this.dataService = dataService;
    this.messageService = messageService;
  }

  async execute(message, args) {
    throw new Error("Execute method must be implemented by subclass");
  }

  async sendMessage(jid, text) {
    return await this.messageService.sendMessage(jid, text);
  }

  isOwner(jid) {
    // Check against owner number (works with both JID and LID)
    const isOwnerByNumber = matchesPhoneNumber(jid, config.OWNER_NUMBER);

    // If owner has configured a specific LID, also check that
    const isOwnerByLID = config.OWNER_LID && jid === config.OWNER_LID;

    return isOwnerByNumber || isOwnerByLID;
  }

  isWhitelisted(jid) {
    // Owner is always whitelisted
    if (this.isOwner(jid)) return true;

    // Extract phone number from sender
    const senderPhone = normalizePhoneNumber(jid);

    // Check against whitelist using phone number comparison
    const isInWhitelist = this.dataService.whitelist.some((whitelistedJid) => {
      const whitelistedPhone = normalizePhoneNumber(whitelistedJid);
      return senderPhone === whitelistedPhone && senderPhone !== "";
    });

    // DEBUG: Log whitelist check in debug mode
    if (config.DEBUG_MODE) {
      console.log(`🔐 Whitelist Check:`);
      console.log(`   Sender JID: ${jid}`);
      console.log(`   Sender Phone: ${senderPhone}`);
      console.log(`   Is Owner: ${this.isOwner(jid)}`);
      console.log(`   Is Whitelisted: ${isInWhitelist}`);
      console.log(
        `   Whitelist: ${JSON.stringify(this.dataService.whitelist)}`
      );
    }

    return isInWhitelist;
  }

  // Utility method for splitting long messages
  splitMessage(text, maxLength = 4000) {
    const chunks = [];
    let currentChunk = "";
    const lines = text.split("\n");

    for (const line of lines) {
      if (currentChunk.length + line.length + 1 > maxLength) {
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = "";
        }
      }
      currentChunk += (currentChunk ? "\n" : "") + line;
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  // Utility method for sending long messages in chunks
  async sendLongMessage(jid, text, maxLength = 4000, delay = 1000) {
    if (text.length <= maxLength) {
      return await this.sendMessage(jid, text);
    }

    const chunks = this.splitMessage(text, maxLength);

    for (let i = 0; i < chunks.length; i++) {
      await this.sendMessage(jid, chunks[i]);
      if (i < chunks.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
}

module.exports = BaseCommand;
