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
class MessageService {
  constructor(sock) {
    this.sock = sock;
  }

  async sendMessage(jid, text) {
    try {
      await this.sock.sendMessage(jid, { text });
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  }

  async sendToGroup(groupMembers, message) {
    let sentCount = 0;

    for (const member of groupMembers) {
      try {
        await this.sendMessage(member.jid, message);
        sentCount++;
      } catch (error) {
        console.error(`Error sending message to ${member.jid}:`, error);
      }
    }

    return sentCount;
  }
}

module.exports = MessageService;
