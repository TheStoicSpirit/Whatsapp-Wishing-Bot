# 🎂 Birthday Bot - Never Miss a Birthday Again!

<div align="center">

<img width="1536" height="431" alt="Birthday Bot Banner" src="https://github.com/user-attachments/assets/db7e4685-697e-4c9b-8ee7-264da7cb04a0" />

**Schedule midnight wishes. Be first. Every time.**

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16-brightgreen)](https://nodejs.org/)
[![Version](https://img.shields.io/badge/version-1.1.0-blue)](https://github.com/TheStoicSpirit/Whatsapp-Wishing-Bot/releases)

[Features](#-features) • [Install](#-installation) • [Commands](#-commands) • [Hosting](#-hosting) • [Support](#-support)

</div>

---

## 🌟 Why This Bot?

Schedule WhatsApp messages for **12:00 AM** sharp. Always be first to wish birthdays, festivals, or any occasion. Set it, forget it, never miss it.

**Perfect For:** Birthdays • Festivals • Team reminders • Family check-ins • Any scheduled message

---

## ✨ Features

- ⏰ **Midnight Precision** - Schedule to exact minute, especially 12:00 AM
- 📦 **Smart Archives** - Auto-archive sent wishes, reschedule for next year
- 👥 **Group Messaging** - Organize contacts, schedule bulk wishes
- 🔐 **Security** - Whitelist control, LID/JID support, bot stays hidden
- 💾 **Data Management** - JSON storage, backups, restore anytime
- 🌐 **LID Support (v1.1)** - Works with both old and new WhatsApp formats

---

## 🚀 Installation

### Prerequisites

- Node.js 16+ ([Download](https://nodejs.org/))
- Git ([Download](https://git-scm.com/))
- WhatsApp account

### Quick Start

```bash
# Clone
git clone https://github.com/TheStoicSpirit/Whatsapp-Wishing-Bot
cd Whatsapp-Wishing-Bot

# Install
npm install

# Configure
cp .env.example .env
nano .env  # Set OWNER_NUMBER

# Run
npm start
```

### First Connection

1. Scan QR code with WhatsApp (Settings → Linked Devices)
2. **LID users:** Save your number, message yourself for commands
3. Test: `Bot, checkid` - Verify your ID format
4. Secure: Set `REQUIRE_WHITELIST=true` in .env

---

## 🔐 Security Setup

**v1.1 introduces strict security mode:**

```env
# .env configuration
REQUIRE_WHITELIST=true   # Strict: Only owner/whitelist (recommended)
REQUIRE_WHITELIST=false  # Relaxed: Anyone uses help/checkid (setup only)
```

**First-Time Setup:**

1. Set `REQUIRE_WHITELIST=false`
2. Run `Bot, checkid` to get your ID
3. Add users: `Bot, whitelist [number] [name]`
4. Enable: `REQUIRE_WHITELIST=true`
5. Restart bot

**Strict mode:** Unauthorized users see nothing. Bot stays hidden. Maximum security.

---

## 💬 Commands

### Essential

| Command                             | Action                  | Example                                                                       |
| ----------------------------------- | ----------------------- | ----------------------------------------------------------------------------- |
| `checkid`                           | Check your ID format    | `Bot, checkid`                                                                |
| `addwish [date] [time] [jid] [msg]` | Schedule wish           | `Bot, addwish 25/12/2025 00:00 919876543210@s.whatsapp.net "Happy Birthday!"` |
| `listwishes`                        | View scheduled          | `Bot, listwishes`                                                             |
| `listarchives [filter]`             | View sent wishes        | `Bot, listarchives sent`                                                      |
| `reschedulewish [id] [date] [time]` | Reschedule from archive | `Bot, reschedulewish 1234567890 25/12/2026 00:00`                             |
| `help`                              | All commands            | `Bot, help`                                                                   |

**Formats:** Date: DD/MM/YYYY • Time: HH:MM (24h) • Number: countrycode+number@s.whatsapp.net

### All Commands

<details>
<summary><b>📅 Wish Management</b></summary>

- `addwish` - Schedule new
- `listwishes` - View active
- `deletewish [id]` - Delete scheduled
- `archivewish [id]` - Manual archive
</details>

<details>
<summary><b>📦 Archives</b></summary>

- `listarchives [filter]` - View (sent/manual/expired/send_failed)
- `reschedulewish [id] [date] [time]` - Reactivate
- `deletearchivedwish [id]` - Permanent delete
</details>

<details>
<summary><b>👥 Groups</b></summary>

- `creategroup [name] [desc]` - New group
- `addtogroup [group] [jid] [name]` - Add member
- `removefromgroup [group] [jid]` - Remove
- `listgroups` - View all
- `listgroupmembers [group]` - View members
- `addgroupwish [date] [time] [group] [msg]` - Schedule
- `sendgroupwishnow [group] [msg]` - Send now
</details>

<details>
<summary><b>🔧 Admin (Owner Only)</b></summary>

- `start/stop` - Bot control
- `status` - Statistics
- `whitelist [jid] [name]` - Add user
- `listwhitelist` - View authorized
- `backup` - Create backup
- `restore [file]` - Restore data
- `cleararchives [keep_N]` - Cleanup
</details>

---

## 🖥️ Hosting

**Bot requires 24/7 uptime to send scheduled messages.**

### Local (Free)

```bash
npm start  # Keep terminal open, computer on
```

### Cloud (Recommended)

**Free:** Railway.app • Render.com • Fly.io  
**Paid:** DigitalOcean ($5/mo) • AWS EC2 • Heroku ($7/mo)

**VPS Setup:**

```bash
npm install -g pm2
pm2 start src/app.js --name birthday-bot
pm2 startup
pm2 save
```

### Home Server

Raspberry Pi or old computer = Perfect 24/7 bot server

---

## 🆘 Troubleshooting

**Connection Issues**

```bash
rm -rf auth_info_baileys
npm start
```

**Commands Not Working**

- Check whitelist: `Bot, listwhitelist` (owner)
- Check security: See `REQUIRE_WHITELIST` in .env
- LID users: Message YOUR OWN number only

**Scheduled Wishes Not Sending**

- Bot running? Check terminal/server
- Computer on? (Local hosting)
- Format correct? DD/MM/YYYY HH:MM
- Wish active? `Bot, listwishes`

**Can't Find Sent Wishes**

```bash
Bot, listarchives sent  # Auto-archived after sending
```

**LID Format (New WhatsApp)**

- Your ID changes per chat
- Save your number as contact
- Message yourself for commands
- Check format: `Bot, checkid`

---

## 📝 Examples

**Midnight Birthday:**

```
Bot, addwish 25/12/2025 00:00 919876543210@s.whatsapp.net "Happy Birthday! 🎂"
```

**Group Setup:**

```
Bot, creategroup family "Family Members"
Bot, addtogroup family 919999999999@s.whatsapp.net "Mom"
Bot, addgroupwish 01/01/2026 00:00 family "Happy New Year! 🎊"
```

**Reschedule Next Year:**

```
Bot, listarchives sent
Bot, reschedulewish 1234567890 25/12/2026 00:00
```

---

## 🤝 Contributing

Fork → Branch → Commit → Push → Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

**AGPL v3.0** - Use freely, keep open source, share modifications.

Full license: [LICENSE](LICENSE)

---

## ⚠️ Disclaimer

Not affiliated with WhatsApp Inc. Use responsibly. Follow [WhatsApp ToS](https://www.whatsapp.com/legal/terms-of-service).

---

## 🙏 Credits

[Baileys](https://github.com/WhiskeySockets/Baileys) • [node-cron](https://github.com/node-cron/node-cron) • All contributors

---

## 📞 Support

- 🐛 [Issues](https://github.com/TheStoicSpirit/Whatsapp-Wishing-Bot/issues)
- 💬 [Discussions](https://github.com/TheStoicSpirit/Whatsapp-Wishing-Bot/discussions)

---

## ⭐ Support This Project

Star • Fork • Share • Contribute • Report bugs

<div align="center">

**Made with ❤️ for everyone who forgets birthdays**

[![GitHub Stars](https://img.shields.io/github/stars/TheStoicSpirit/Whatsapp-Wishing-Bot?style=social)](https://github.com/TheStoicSpirit/Whatsapp-Wishing-Bot)

</div>
