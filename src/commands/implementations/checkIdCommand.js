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
  isLID,
  getJIDType,
  normalizePhoneNumber,
} = require("../../utils/validators");
const config = require("../../config/config");

class CheckIdCommand extends BaseCommand {
  async execute(message, args) {
    const senderId = message.key.remoteJid;
    const phoneNumber = normalizePhoneNumber(senderId);
    const idType = getJIDType(senderId);
    const isUsingLID = isLID(senderId);

    let responseText = `📱 *Your WhatsApp ID Information*\n\n`;
    responseText += `🔢 *Phone Number:* ${phoneNumber}\n`;
    responseText += `🆔 *Full ID:* ${senderId}\n`;
    responseText += `📋 *Format Type:* ${idType}\n\n`;

    if (isUsingLID) {
      // User is using LID format (new WhatsApp)
      responseText += `⚠️ *You are using the new LID format!*\n\n`;
      responseText += `📌 *IMPORTANT:* Your WhatsApp ID changes per conversation!\n\n`;
      responseText += `✅ *To use bot commands:*\n`;
      responseText += `   • Message YOUR OWN number (saved as a contact)\n`;
      responseText += `   • Don't run commands in other people's chats\n`;
      responseText += `   • The bot matches your phone number automatically\n\n`;

      // Check if user is the owner
      if (this.isOwner(senderId)) {
        responseText += `✅ *Owner Status:* Recognized as bot owner\n\n`;

        // Check if LID is configured in .env
        if (config.OWNER_LID) {
          if (config.OWNER_LID === senderId) {
            responseText += `✅ Your LID is already configured in .env file.\n`;
          } else {
            responseText += `⚠️ *Action Required:*\n`;
            responseText += `Your configured LID in .env doesn't match this chat.\n\n`;
            responseText += `*Current LID in .env:*\n${config.OWNER_LID}\n\n`;
            responseText += `*This chat's LID:*\n${senderId}\n\n`;
            responseText += `To update, add this to your .env file:\n`;
            responseText += `\`\`\`\nOWNER_LID=${senderId}\n\`\`\`\n\n`;
            responseText += `Note: LID changes per chat, so phone number matching is recommended.`;
          }
        } else {
          responseText += `💡 *Optional Optimization:*\n\n`;
          responseText += `For faster owner recognition, you can add your LID to .env:\n\n`;
          responseText += `\`\`\`\nOWNER_LID=${senderId}\n\`\`\`\n\n`;
          responseText += `However, the bot already works by matching your phone number (${phoneNumber}), `;
          responseText += `so this is optional.`;
        }
      } else {
        responseText += `ℹ️ You are not the bot owner.\n`;
        responseText += `The bot will recognize you by your phone number (${phoneNumber}).`;
      }
    } else {
      // User is using standard JID format (older WhatsApp)
      responseText += `✅ *You are using the standard JID format*\n\n`;
      responseText += `Your WhatsApp uses the traditional ID format. `;
      responseText += `No special configuration needed!\n\n`;

      if (this.isOwner(senderId)) {
        responseText += `✅ *Owner Status:* Recognized as bot owner\n\n`;
        responseText += `Your OWNER_NUMBER in .env is correctly set to:\n`;
        responseText += `\`\`\`\n${config.OWNER_NUMBER}\n\`\`\``;
      } else {
        responseText += `ℹ️ You are not the bot owner.`;
      }
    }

    // Add whitelist status
    if (this.isWhitelisted(senderId) && !this.isOwner(senderId)) {
      responseText += `\n\n✅ *Whitelist Status:* You are whitelisted`;
    } else if (!this.isWhitelisted(senderId) && !this.isOwner(senderId)) {
      responseText += `\n\n❌ *Whitelist Status:* Not whitelisted`;
    }

    responseText += `\n\n---\n`;
    responseText += `ℹ️ *About LID vs JID:*\n`;
    responseText += `• *JID* (old): Fixed ID like 919876543210@s.whatsapp.net\n`;
    responseText += `• *LID* (new): Changes per chat for privacy\n`;
    responseText += `• Birthday Bot supports both formats automatically! 🎉`;

    await this.sendLongMessage(senderId, responseText);

    // Log the check
    this.dataService.logActivity({
      type: "id_check",
      user: senderId,
      phone_number: phoneNumber,
      format: idType,
      is_lid: isUsingLID,
      is_owner: this.isOwner(senderId),
    });
  }
}

module.exports = CheckIdCommand;
