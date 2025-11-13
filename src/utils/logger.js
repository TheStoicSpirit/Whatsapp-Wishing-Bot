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
const P = require("pino");
const config = require("../config/config");

let logger;

switch (config.LOGGING_MODE) {
  case "disabled":
    // Create a silent Pino logger that has all methods but outputs nothing
    logger = P({
      level: "silent", // This disables all output
      timestamp: () => `,"time":"${new Date().toJSON()}"`,
    });
    break;

  case "console":
    // Log to console only
    logger = P({
      timestamp: () => `,"time":"${new Date().toJSON()}"`,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      },
    });
    logger.level = "trace";
    break;

  case "file":
  default:
    // Log to file
    logger = P(
      { timestamp: () => `,"time":"${new Date().toJSON()}"` },
      P.destination(config.LOG_FILE_PATH)
    );
    logger.level = "trace";
    break;
}

module.exports = logger;
