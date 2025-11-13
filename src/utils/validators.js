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
class Validators {
  static validateDateFormat(date) {
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!dateRegex.test(date)) return false;

    const [day, month, year] = date.split("/").map(Number);
    const isValidDate = !isNaN(new Date(`${year}-${month}-${day}`).getTime());
    return isValidDate;
  }

  static validateTimeFormat(time) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  static formatJID(jid) {
    return jid.includes("@s.whatsapp.net") ? jid : `${jid}@s.whatsapp.net`;
  }

  static getCurrentDateTime() {
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
}

module.exports = Validators;
