# Changelog

All notable changes to Birthday Bot will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2025-11-16

### 🎉 LID Support & Security Update

#### ✨ Added

**WhatsApp LID Support**

- Auto-detection for both JID (old) and LID (new) WhatsApp formats
- Phone number matching across different conversation contexts
- New `checkid` command to verify ID format
- First-time setup guidance for LID users
- Optional `OWNER_LID` configuration

**Enhanced Security**

- `REQUIRE_WHITELIST` setting - toggle strict/relaxed security mode
- Strict mode: Only whitelisted users can use ANY command
- Relaxed mode: Public access to help/checkid for initial setup
- Silent ignore for unauthorized users (bot stays hidden)
- Debug logging for access attempts

**Improved UX**

- Clean console output (removed Baileys warnings)
- Professional startup banner
- Clear QR code display with instructions
- Security mode indicator on startup
- Better reconnection handling

#### 🐛 Fixed

**Critical**

- Whitelist authentication now works correctly
- Owner recognition with LID format
- Phone number extraction and comparison
- Command access control logic

**Improvements**

- Exponential backoff for reconnections
- Cleaner error messages
- Better LID usage instructions
- Console output clarity

#### 📚 Documentation

- Updated README with LID information
- Added security configuration guide
- Updated .env.example with REQUIRE_WHITELIST
- LID troubleshooting section
- Setup workflow for new users

#### 🔧 Technical

**New Functions:**

- `normalizePhoneNumber()` - Extract phone from JID/LID
- `matchesPhoneNumber()` - Universal ID comparison
- `isLID()` - Detect LID format
- `getJIDType()` - Get readable ID type

**New Command:**

- `checkid` - Check WhatsApp ID format and status

**Updated Files:**

- `validators.js` - LID support functions
- `baseCommand.js` - Fixed whitelist checking
- `commandManager.js` - Security mode logic
- `whatsAppBot.js` - LID detection and clean output
- `config.js` - REQUIRE_WHITELIST setting
- `.env.example` - Security documentation

#### ⚠️ Important

**For LID Users:**

- Your ID changes per conversation
- Always message YOUR OWN number to run commands
- Bot recognizes you by phone number

**Setup Workflow:**

1. Set `REQUIRE_WHITELIST=false` initially
2. Use `Bot, checkid` to get your ID
3. Add to whitelist if needed
4. Set `REQUIRE_WHITELIST=true` for security

**Migration:**

- No breaking changes
- Update and restart
- Existing users: No action needed

---

## [1.0.0] - 2025-11-13

### 🎉 First Public Release

Birthday Bot is now public! Schedule birthday wishes for midnight and always be the first to wish your loved ones.

### ✨ Features

#### Midnight Scheduling

- Schedule for exactly 12:00 AM
- Automatic sending via cron (every minute)
- View and manage scheduled wishes
- DD/MM/YYYY HH:MM format

#### Archive System

- Auto-archiving of sent wishes
- Filter by status (sent/manual/expired/send_failed)
- Reschedule for future dates
- Track delivery with error details
- Bulk cleanup options

#### Group Management

- Create custom groups
- Add/remove members
- Schedule group wishes
- Immediate group messages

#### Security & Access

- Whitelist-based access control
- Owner-only admin commands
- Bot start/stop controls
- Activity logging
- Local data storage

#### Data Management

- JSON-based persistence
- Timestamped backups
- Easy restore
- Optimized file structure

### 📋 Commands (25 Total)

**Wish:** addwish, listwishes, deletewish, archivewish  
**Archive:** listarchives, reschedulewish, deletearchivedwish  
**Group:** creategroup, addtogroup, removefromgroup, listgroups, listgroupmembers, addgroupwish, listgroupwishes, sendgroupwishnow  
**Admin:** start, stop, status, whitelist, removewhitelist, listwhitelist, backup, restore, clearlogs, archiveoldwishes, cleararchives  
**Utility:** help

### 🛠️ Technical

**Stack:**

- @whiskeysockets/baileys 7.0.0-rc.6
- node-cron
- dotenv
- pino

**Architecture:**

- Modular command system
- Separated services
- Environment configuration
- Async/await throughout

### 📚 Documentation

- Complete installation guide
- Hosting options (local/cloud/VPS)
- Contributing guidelines
- AGPL v3.0 license

### 🔒 Security

- AGPL v3 license
- Whitelist system
- Owner-only commands
- Local storage only

---

## [Unreleased]

### Planned for v1.2.0

- Recurring wishes (yearly)
- Message templates
- Bulk CSV import
- Group wish archives

### Planned for v2.0.0

- Web dashboard
- Database support
- Media messages
- Time zones
- Multi-language

---

## Upgrade Instructions

### v1.0.0 → v1.1.0

```bash
# Pull latest
git pull origin main

# Restart
npm start

# Check your ID format (optional)
Bot, checkid

# Enable strict security (recommended)
# Set REQUIRE_WHITELIST=true in .env
```

**No breaking changes** - seamless upgrade!

---

## Contributors

**v1.1.0:** The Stoic Spirit - LID support & security  
**v1.0.0:** The Stoic Spirit - Initial release

---

## Links

- [GitHub](https://github.com/TheStoicSpirit/Whatsapp-Wishing-Bot)
- [Issues](https://github.com/TheStoicSpirit/Whatsapp-Wishing-Bot/issues)
- [Discussions](https://github.com/TheStoicSpirit/Whatsapp-Wishing-Bot/discussions)

---

**Legend:**
✨ Added | 🔧 Changed | 🐛 Fixed | 🔒 Security | 🚀 Performance | 📚 Docs
