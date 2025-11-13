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
    return jid === config.OWNER_NUMBER;
  }

  isWhitelisted(jid) {
    return this.isOwner(jid) || this.dataService.whitelist.includes(jid);
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
