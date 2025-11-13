# Changelog

All notable changes to Birthday Bot will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2025-11-13

### 🎉 First Public Release

Birthday Bot is now public! Schedule birthday wishes for midnight and always be the first to wish your loved ones.

### ✨ Features

#### Midnight Scheduling

- **Be the first to wish** - Schedule for exactly 12:00 AM
- Schedule messages to the minute (DD/MM/YYYY HH:MM format)
- Automatic sending via cron scheduler (runs every minute)
- View all active scheduled wishes
- Delete wishes before they're sent

#### Archive System

- Automatic archiving of sent wishes
- Separate storage for better performance
- Filter archives by status (sent/manual/expired/send_failed)
- Reschedule archived wishes for future dates
- Track delivery status with error details
- Bulk cleanup with retention options

#### Group Management

- Create custom groups with descriptions
- Add/remove group members
- Schedule wishes to entire groups
- Send immediate messages to groups
- View group members and statistics

#### Security & Access

- Whitelist-based access control
- Owner-only admin commands
- Bot start/stop controls
- Activity logging
- Secure local data storage

#### Data Management

- JSON-based persistence
- Timestamped backups on demand
- Easy restore from backups
- Separated data files for performance

### 📋 Commands (25 Total)

**Wish Management:** addwish, listwishes, deletewish, archivewish  
**Archive Management:** listarchives, reschedulewish, deletearchivedwish  
**Group Management:** creategroup, addtogroup, removefromgroup, listgroups, listgroupmembers, addgroupwish, listgroupwishes, sendgroupwishnow  
**Admin Commands:** start, stop, status, whitelist, removewhitelist, listwhitelist, backup, restore, clearlogs, archiveoldwishes, cleararchives  
**Utility:** help

### 🛠️ Technical

**Architecture:**

- Modular command system with base classes
- Separated services (data, messaging, scheduling)
- Environment-based configuration
- Pino logging with multiple modes

**Dependencies:**

- @whiskeysockets/baileys 7.0.0-rc.6
- node-cron for scheduling
- dotenv for configuration
- pino for logging

**Performance:**

- Scheduler only checks active wishes
- Efficient JSON-based storage
- Async/await throughout
- Graceful error handling

### 📚 Documentation

- Complete README with installation guide
- Hosting options (local, cloud, VPS)
- Contributing guidelines
- Technical documentation (ProjectSummary.md)
- AGPL v3.0 license

### 🔒 Security

- AGPL v3 license (prevents proprietary forks)
- Whitelist system for command access
- Owner-only administrative commands
- No sensitive data in repository
- Local session storage

---

## [Unreleased]

### Planned for v1.1.0

- Recurring wishes (yearly birthdays)
- Wish templates
- Better error notifications
- Bulk wish import from CSV

### Planned for v2.0.0

- Web dashboard
- Database support
- Media messages (images, videos)
- Time zone support
- Multi-language support

---

## Upgrade Instructions

```bash
# 1. Backup data
Bot, backup

# 2. Pull latest
git pull origin main

# 3. Install dependencies
npm install

# 4. Restart
npm start
```

---

## Contributors

**v1.0.0:** The Stoic Spirit - Initial public release

---

## Links

- [GitHub](https://github.com/TheStoicSpirit/Whatsapp-Wishing-Bot)
- [Issues](https://github.com/TheStoicSpirit/Whatsapp-Wishing-Bot/issues)
- [Discussions](https://github.com/TheStoicSpirit/Whatsapp-Wishing-Bot/discussions)

---

**Legend:**

- ✨ Added | 🔧 Changed | 🐛 Fixed | 🔒 Security | 🚀 Performance | 📚 Docs
