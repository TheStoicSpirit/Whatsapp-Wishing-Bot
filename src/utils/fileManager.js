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
const fs = require("fs");
const path = require("path");

class FileManager {
  static loadJSON(filePath, defaultValue = null) {
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, "utf8");
        return JSON.parse(data);
      }
    } catch (error) {
      console.error(`Error loading ${filePath}:`, error);
    }
    return defaultValue;
  }

  static saveJSON(filePath, data) {
    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error saving ${filePath}:`, error);
      return false;
    }
  }

  static ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
}

module.exports = FileManager;
