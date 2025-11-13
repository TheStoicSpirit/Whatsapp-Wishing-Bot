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

class CreateGroupCommand extends BaseCommand {
  async execute(message, args) {
    const senderId = message.key.remoteJid;

    if (!this.isWhitelisted(senderId)) {
      await this.sendMessage(
        senderId,
        "❌ You are not authorized to use this command."
      );
      return;
    }

    if (args.length < 2) {
      await this.sendMessage(
        senderId,
        '❌ Usage: creategroup [groupName] [description]\nExample: creategroup family "Close family members"'
      );
      return;
    }

    const groupName = args[0];
    const description = args.slice(1).join(" ");

    // Check if group already exists
    if (this.dataService.userGroups[groupName]) {
      await this.sendMessage(
        senderId,
        `❌ Group "${groupName}" already exists.`
      );
      return;
    }

    // Create new group
    this.dataService.userGroups[groupName] = {
      name: groupName,
      description: description,
      created_by: senderId,
      created_at: new Date().toISOString(),
      members: [],
    };

    // Save to file
    if (this.dataService.saveUserGroups()) {
      await this.sendMessage(
        senderId,
        `✅ Group created successfully!\n\n🏷️ *Name:* ${groupName}\n📝 *Description:* ${description}\n👤 *Created by:* ${senderId}\n👥 *Members:* 0`
      );

      this.dataService.logActivity({
        type: "group_created",
        group_name: groupName,
        created_by: senderId,
      });
    } else {
      await this.sendMessage(
        senderId,
        "❌ Failed to create group. Please try again."
      );
    }
  }
}

class AddToGroupCommand extends BaseCommand {
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
        '❌ Usage: addtogroup [groupName] [jid] [name]\nExample: addtogroup family 1234567890@s.whatsapp.net "John Doe"'
      );
      return;
    }

    const groupName = args[0];
    const jid = formatJID(args[1]);
    const memberName = args.slice(2).join(" ");

    // Check if group exists
    if (!this.dataService.userGroups[groupName]) {
      await this.sendMessage(
        senderId,
        `❌ Group "${groupName}" does not exist.`
      );
      return;
    }

    const group = this.dataService.userGroups[groupName];

    // Check if user is already in group
    const existingMember = group.members.find((m) => m.jid === jid);
    if (existingMember) {
      await this.sendMessage(
        senderId,
        `❌ User ${jid} is already a member of "${groupName}".`
      );
      return;
    }

    // Add member to group
    group.members.push({
      jid: jid,
      name: memberName,
      added_by: senderId,
      added_at: new Date().toISOString(),
    });

    // Save to file
    if (this.dataService.saveUserGroups()) {
      await this.sendMessage(
        senderId,
        `✅ Member added successfully!\n\n👥 *Group:* ${groupName}\n👤 *Member:* ${memberName} (${jid})\n📊 *Total members:* ${group.members.length}`
      );

      this.dataService.logActivity({
        type: "member_added_to_group",
        group_name: groupName,
        member_jid: jid,
        member_name: memberName,
        added_by: senderId,
      });
    } else {
      await this.sendMessage(
        senderId,
        "❌ Failed to add member. Please try again."
      );
    }
  }
}

class RemoveFromGroupCommand extends BaseCommand {
  async execute(message, args) {
    const senderId = message.key.remoteJid;

    if (!this.isWhitelisted(senderId)) {
      await this.sendMessage(
        senderId,
        "❌ You are not authorized to use this command."
      );
      return;
    }

    if (args.length < 2) {
      await this.sendMessage(
        senderId,
        "❌ Usage: removefromgroup [groupName] [jid]\nExample: removefromgroup family 1234567890@s.whatsapp.net"
      );
      return;
    }

    const groupName = args[0];
    const jid = formatJID(args[1]);

    // Check if group exists
    if (!this.dataService.userGroups[groupName]) {
      await this.sendMessage(
        senderId,
        `❌ Group "${groupName}" does not exist.`
      );
      return;
    }

    const group = this.dataService.userGroups[groupName];

    // Find member index
    const memberIndex = group.members.findIndex((m) => m.jid === jid);
    if (memberIndex === -1) {
      await this.sendMessage(
        senderId,
        `❌ User ${jid} is not a member of "${groupName}".`
      );
      return;
    }

    // Remove member
    const removedMember = group.members.splice(memberIndex, 1)[0];

    // Save to file
    if (this.dataService.saveUserGroups()) {
      await this.sendMessage(
        senderId,
        `✅ Member removed successfully!\n\n👥 *Group:* ${groupName}\n👤 *Removed:* ${removedMember.name} (${jid})\n📊 *Total members:* ${group.members.length}`
      );

      this.dataService.logActivity({
        type: "member_removed_from_group",
        group_name: groupName,
        member_jid: jid,
        member_name: removedMember.name,
        removed_by: senderId,
      });
    } else {
      await this.sendMessage(
        senderId,
        "❌ Failed to remove member. Please try again."
      );
    }
  }
}

class ListGroupsCommand extends BaseCommand {
  async execute(message, args) {
    const senderId = message.key.remoteJid;

    if (!this.isWhitelisted(senderId)) {
      await this.sendMessage(
        senderId,
        "❌ You are not authorized to use this command."
      );
      return;
    }

    const groups = Object.values(this.dataService.userGroups);

    if (groups.length === 0) {
      await this.sendMessage(senderId, "👥 No groups found.");
      return;
    }

    let groupList = `👥 *Available Groups* (${groups.length})\n\n`;

    for (const group of groups) {
      const createdDate = new Date(group.created_at).toLocaleDateString();
      groupList += `🏷️ *Name:* ${group.name}\n`;
      groupList += `📝 *Description:* ${group.description}\n`;
      groupList += `👤 *Created by:* ${group.created_by}\n`;
      groupList += `📅 *Created:* ${createdDate}\n`;
      groupList += `👥 *Members:* ${group.members.length}\n\n`;
    }

    await this.sendMessage(senderId, groupList);
  }
}

class ListGroupMembersCommand extends BaseCommand {
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
        "❌ Usage: listgroupmembers [groupName]\nExample: listgroupmembers family"
      );
      return;
    }

    const groupName = args[0];

    // Check if group exists
    if (!this.dataService.userGroups[groupName]) {
      await this.sendMessage(
        senderId,
        `❌ Group "${groupName}" does not exist.`
      );
      return;
    }

    const group = this.dataService.userGroups[groupName];

    if (group.members.length === 0) {
      await this.sendMessage(
        senderId,
        `👥 Group "${groupName}" has no members.`
      );
      return;
    }

    let memberList = `👥 *Members of "${groupName}"* (${group.members.length})\n\n`;

    for (let i = 0; i < group.members.length; i++) {
      const member = group.members[i];
      const addedDate = new Date(member.added_at).toLocaleDateString();
      memberList += `${i + 1}. *${member.name}*\n`;
      memberList += `   📱 ${member.jid}\n`;
      memberList += `   📅 Added: ${addedDate}\n`;
      memberList += `   👤 Added by: ${member.added_by}\n\n`;
    }

    await this.sendMessage(senderId, memberList);
  }
}

class AddGroupWishCommand extends BaseCommand {
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
        '❌ Usage: addgroupwish [date] [time] [groupName] [message]\nExample: addgroupwish 01/01 00:00 family "Happy New Year everyone! 🎉"'
      );
      return;
    }

    const [date, time, groupName, ...messageParts] = args;
    const wishMessage = messageParts.join(" ");

    // Validate date format
    if (!validateDateFormat(date)) {
      await this.sendMessage(
        senderId,
        "❌ Invalid date format. Use DD/MM format (e.g., 01/01)"
      );
      return;
    }

    // Validate time format
    if (!validateTimeFormat(time)) {
      await this.sendMessage(
        senderId,
        "❌ Invalid time format. Use HH:MM format (e.g., 00:00)"
      );
      return;
    }

    // Check if group exists
    if (!this.dataService.userGroups[groupName]) {
      await this.sendMessage(
        senderId,
        `❌ Group "${groupName}" does not exist.`
      );
      return;
    }

    const group = this.dataService.userGroups[groupName];

    if (group.members.length === 0) {
      await this.sendMessage(
        senderId,
        `❌ Group "${groupName}" has no members.`
      );
      return;
    }

    // Create group wish object
    const groupWish = {
      id: Date.now().toString(),
      date,
      time,
      groupName,
      message: wishMessage,
      created_by: senderId,
      created_at: new Date().toISOString(),
    };

    // Add to group wishes array
    this.dataService.groupWishes.push(groupWish);

    // Save to file
    if (this.dataService.saveGroupWishes()) {
      await this.sendMessage(
        senderId,
        `✅ Group wish scheduled successfully!\n\n📅 *Date:* ${date}\n⏰ *Time:* ${time}\n👥 *Group:* ${groupName} (${group.members.length} members)\n💬 *Message:* "${wishMessage}"\n🆔 *ID:* ${groupWish.id}`
      );

      this.dataService.logActivity({
        type: "group_wish_added",
        group_wish_id: groupWish.id,
        group_name: groupName,
        created_by: senderId,
        scheduled_for: `${date} ${time}`,
        member_count: group.members.length,
      });
    } else {
      await this.sendMessage(
        senderId,
        "❌ Failed to save group wish. Please try again."
      );
    }
  }
}

class ListGroupWishesCommand extends BaseCommand {
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

    // Filter group wishes based on user permissions
    const userGroupWishes = isOwner
      ? this.dataService.groupWishes
      : this.dataService.groupWishes.filter((w) => w.created_by === senderId);

    if (userGroupWishes.length === 0) {
      await this.sendMessage(senderId, "📅 No group wishes found.");
      return;
    }

    // Sort wishes by date and time
    userGroupWishes.sort((a, b) => {
      const dateA = new Date(`2024/${a.date} ${a.time}`);
      const dateB = new Date(`2024/${b.date} ${b.time}`);
      return dateA - dateB;
    });

    let wishList = `📅 *Scheduled Group Wishes* (${userGroupWishes.length})\n\n`;

    for (const wish of userGroupWishes) {
      const createdDate = new Date(wish.created_at).toLocaleDateString();
      const group = this.dataService.userGroups[wish.groupName];
      const memberCount = group ? group.members.length : 0;

      wishList += `🆔 *ID:* ${wish.id}\n`;
      wishList += `📅 *Date:* ${wish.date}\n`;
      wishList += `⏰ *Time:* ${wish.time}\n`;
      wishList += `👥 *Group:* ${wish.groupName} (${memberCount} members)\n`;
      wishList += `💬 *Message:* "${wish.message}"\n`;
      wishList += `📝 *Created:* ${createdDate}\n`;

      if (isOwner) {
        wishList += `👨‍💼 *Created by:* ${wish.created_by}\n`;
      }

      wishList += `\n`;
    }

    await this.sendMessage(senderId, wishList);
  }
}

class SendGroupWishNowCommand extends BaseCommand {
  async execute(message, args) {
    const senderId = message.key.remoteJid;

    if (!this.isWhitelisted(senderId)) {
      await this.sendMessage(
        senderId,
        "❌ You are not authorized to use this command."
      );
      return;
    }

    if (args.length < 2) {
      await this.sendMessage(
        senderId,
        '❌ Usage: sendgroupwishnow [groupName] [message]\nExample: sendgroupwishnow family "Hello everyone!"'
      );
      return;
    }

    const groupName = args[0];
    const wishMessage = args.slice(1).join(" ");

    // Check if group exists
    if (!this.dataService.userGroups[groupName]) {
      await this.sendMessage(
        senderId,
        `❌ Group "${groupName}" does not exist.`
      );
      return;
    }

    const group = this.dataService.userGroups[groupName];

    if (group.members.length === 0) {
      await this.sendMessage(
        senderId,
        `❌ Group "${groupName}" has no members.`
      );
      return;
    }

    // Send message to all group members
    const sentCount = await this.messageService.sendToGroup(
      group.members,
      wishMessage
    );

    await this.sendMessage(
      senderId,
      `✅ Group wish sent successfully!\n\n👥 *Group:* ${groupName}\n📊 *Sent to:* ${sentCount}/${group.members.length} members\n💬 *Message:* "${wishMessage}"`
    );

    this.dataService.logActivity({
      type: "group_wish_sent_now",
      group_name: groupName,
      sent_by: senderId,
      sent_count: sentCount,
      total_members: group.members.length,
      message: wishMessage,
    });
  }
}

module.exports = {
  CreateGroupCommand,
  AddToGroupCommand,
  RemoveFromGroupCommand,
  ListGroupsCommand,
  ListGroupMembersCommand,
  AddGroupWishCommand,
  ListGroupWishesCommand,
  SendGroupWishNowCommand,
};
