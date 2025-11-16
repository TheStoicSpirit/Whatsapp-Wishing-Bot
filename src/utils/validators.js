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
function validateDateFormat(date) {
  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  if (!dateRegex.test(date)) return false;
  const [day, month, year] = date.split("/").map(Number);
  const isValidDate = !isNaN(new Date(`${year}-${month}-${day}`).getTime());
  return isValidDate;
}

function validateTimeFormat(time) {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

function formatJID(jid) {
  return jid.includes("@") ? jid : `${jid}@s.whatsapp.net`;
}

function getCurrentDateTime() {
  const now = new Date();
  return {
    date: `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${now.getFullYear()}`,
    time: `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`,
    full: now.toISOString(),
  };
}

// NEW - Extract phone number from JID (works with @s.whatsapp.net and @lid)
function normalizePhoneNumber(jid) {
  if (!jid) return "";
  // Extract the part before @ symbol and remove any non-digits
  return jid.split("@")[0].replace(/\D/g, "");
}

// NEW - Compare two JIDs by phone number only (LID-compatible)
function matchesPhoneNumber(jid1, jid2) {
  if (!jid1 || !jid2) return false;
  const num1 = normalizePhoneNumber(jid1);
  const num2 = normalizePhoneNumber(jid2);
  return num1 === num2;
}

// NEW - Check if JID uses LID format
function isLID(jid) {
  return jid && jid.includes("@lid");
}

// NEW - Get JID type (for user information)
function getJIDType(jid) {
  if (isLID(jid)) return "LID (New WhatsApp Format)";
  if (jid.includes("@s.whatsapp.net")) return "JID (Standard Format)";
  return "Unknown Format";
}

module.exports = {
  validateDateFormat,
  validateTimeFormat,
  formatJID,
  getCurrentDateTime,
  normalizePhoneNumber,
  matchesPhoneNumber,
  isLID,
  getJIDType,
};
