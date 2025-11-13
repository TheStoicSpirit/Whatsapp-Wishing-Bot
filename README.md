# 🎂 Birthday Bot - Never Miss a Birthday Again!

<div align="center">

<img width="1536" height="431" alt="Birthday Bot Banner" src="https://github.com/user-attachments/assets/db7e4685-697e-4c9b-8ee7-264da7cb04a0" />

**Automate your birthday wishes and be the first to wish at 12 AM! Schedule WhatsApp messages in advance and let the bot handle the rest.**

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16-brightgreen)](https://nodejs.org/)

[Features](#-features) • [Quick Start](#-quick-start) • [Hosting](#-hosting-options) • [Commands](#-commands) • [Support](#-support)

</div>

---

## 🌟 Why Birthday Bot?

**Be the first to wish!** 🎉

Schedule birthday wishes for **12:00 AM** (midnight) and always be the first person to wish your friends and family. No more setting alarms or forgetting birthdays - Birthday Bot handles it all automatically.

### Perfect For:

- 🎂 **Birthday Wishes** - Schedule for exactly midnight, be the first to wish!
- 🎉 **Festivals & Holidays** - New Year, Christmas, Diwali, Valentine's Day
- 💼 **Team Reminders** - Meeting notifications and deadlines
- 👨‍👩‍👧‍👦 **Family Check-ins** - Regular messages to loved ones
- 📅 **Any Scheduled Message** - Anniversaries, appointments, follow-ups

---

## ✨ Key Features

### ⏰ Precise Scheduling

- **Schedule to the minute** - Send at exactly 12:00 AM or any time
- **Never forget again** - Set it once, bot handles the rest
- **View all scheduled wishes** - Know what's coming up
- **Midnight advantage** - Be the earliest to wish, always! 🌙

### 📦 Smart Archive System

- **Auto-archiving** - Sent messages moved to archives automatically
- **Reschedule easily** - Reuse last year's wishes for this year
- **Track delivery** - Know which messages were sent successfully
- **Filter archives** - View by sent, failed, or manual archives

### 👥 Group Management

- **Create groups** - Organize contacts (family, friends, coworkers)
- **Bulk messaging** - Send to entire groups at once
- **Group scheduling** - Schedule messages for multiple people

### 🔐 Secure & Private

- **Whitelist control** - Only you and authorized users can use it
- **Local data storage** - All data stays on your device
- **Open source** - Fully transparent code

---

## ⚡ Quick Start

### Prerequisites

Before starting, install these on your system:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **WhatsApp** account with active phone number

> **Verify installation:** Run `node --version` and `git --version` in your terminal

---

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/TheStoicSpirit/Whatsapp-Wishing-Bot
cd .\Whatsapp-Wishing-Bot\

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
nano .env  # Edit with your WhatsApp number

# 4. Start the bot
npm start
```

### Configuration

Edit the `.env` file and set your WhatsApp number in JID format:

```env
# Your WhatsApp number (required)
# Format: [country_code][number]@s.whatsapp.net
# Example: +1 555-123-4567 → 15551234567@s.whatsapp.net
OWNER_NUMBER=919876543210@s.whatsapp.net

# Optional settings
COMMAND_PREFIX=Bot,
DEBUG_MODE=false
```

### First Connection

1. Run `npm start`
2. **Scan the QR code** with WhatsApp (Settings → Linked Devices)
3. See "🎉 Birthday Bot is ready!"
4. Send `Bot, help` to see commands

**That's it!** 🎉 Your bot is now running.

---

## 🖥️ Hosting Options

> **Important:** The bot must run 24/7 to send scheduled messages. If your computer is off, messages won't be sent.

### Option 1: Run on Your Computer (Free)

**Pros:** Free, complete control  
**Cons:** Computer must stay on 24/7

```bash
npm start
# Keep terminal open and computer running
```

### Option 2: Cloud Hosting (Recommended for 24/7)

**Free Options:**

- **Railway.app** - Free tier with 500 hours/month
- **Render.com** - Free tier available
- **Fly.io** - Free tier with generous limits

**Paid Options (Reliable 24/7):**

- **DigitalOcean** - $5/month droplet
- **AWS EC2** - t2.micro free tier (12 months)
- **Heroku** - Starting at $7/month
- **Google Cloud** - Free tier available

**Setup Example (VPS/Linux Server):**

```bash
# Clone and install as above, then:
npm install -g pm2
pm2 start src/app.js --name birthday-bot
pm2 startup  # Auto-start on reboot
pm2 save
```

### Option 3: Raspberry Pi / Old Computer

Turn an old computer or Raspberry Pi into a dedicated bot server. Perfect for 24/7 home operation!

> **Note:** For cloud hosting, you'll need to keep the authentication by periodically accessing the server (auth expires after ~2 weeks of inactivity).

---

## 🎮 Usage Examples

### Schedule a Midnight Birthday Wish

```
Bot, addwish 25/12/2025 00:00 919876543210@s.whatsapp.net "Happy Birthday! 🎂 Hope you have an amazing year ahead! 🎉"
```

_The bot will send this at exactly midnight on Dec 25th_

### Schedule for 12:01 AM (Right After Midnight)

```
Bot, addwish 15/03/2026 00:01 918888888888@s.whatsapp.net "Happy Birthday Sarah! 🎈 Wishing you a wonderful day!"
```

_Perfect for being the first to wish!_

### Create Groups for Easy Management

```
# Create a friends group
Bot, creategroup close-friends "My closest friends"

# Add members
Bot, addtogroup close-friends 919999999999@s.whatsapp.net "Alice"
Bot, addtogroup close-friends 918888888888@s.whatsapp.net "Bob"

# Schedule group wish
Bot, addgroupwish 01/01/2026 00:00 close-friends "Happy New Year everyone! 🎊"
```

### Reschedule from Archives (For Next Year)

```
# View sent wishes
Bot, listarchives sent

# Reschedule for next year
Bot, reschedulewish 1234567890 25/12/2026 00:00
```

---

## 📚 Commands

### Quick Reference

| Command                                | What It Does            | Example                                                                       |
| -------------------------------------- | ----------------------- | ----------------------------------------------------------------------------- |
| `addwish [date] [time] [number] [msg]` | Schedule a wish         | `Bot, addwish 25/12/2025 00:00 919876543210@s.whatsapp.net "Happy Birthday!"` |
| `listwishes`                           | View scheduled wishes   | `Bot, listwishes`                                                             |
| `deletewish [id]`                      | Delete a wish           | `Bot, deletewish 1234567890`                                                  |
| `listarchives [filter]`                | View sent wishes        | `Bot, listarchives sent`                                                      |
| `reschedulewish [id] [date] [time]`    | Reschedule from archive | `Bot, reschedulewish 1234567890 25/12/2026 00:00`                             |
| `help`                                 | Show all commands       | `Bot, help`                                                                   |

**Date Format:** DD/MM/YYYY (e.g., 25/12/2025)  
**Time Format:** HH:MM in 24-hour (e.g., 00:00 for midnight, 14:30 for 2:30 PM)  
**Number Format:** Country code + number + @s.whatsapp.net (e.g., 919876543210@s.whatsapp.net)

### All Commands

<details>
<summary><b>📅 Wish Management</b></summary>

- `addwish [date] [time] [jid] [message]` - Schedule new wish
- `listwishes` - View all scheduled wishes
- `deletewish [id]` - Delete scheduled wish
- `archivewish [id]` - Manually archive wish
</details>

<details>
<summary><b>📦 Archive Management</b></summary>

- `listarchives [filter]` - View archives (sent/manual/expired/send_failed)
- `reschedulewish [id] [date] [time]` - Reschedule archived wish
- `deletearchivedwish [id]` - Delete archived wish permanently
</details>

<details>
<summary><b>👥 Group Management</b></summary>

- `creategroup [name] [description]` - Create group
- `listgroups` - View all groups
- `addtogroup [group] [jid] [name]` - Add member
- `removefromgroup [group] [jid]` - Remove member
- `listgroupmembers [group]` - View group members
- `addgroupwish [date] [time] [group] [msg]` - Schedule group wish
- `sendgroupwishnow [group] [message]` - Send immediate message
</details>

<details>
<summary><b>🔧 Admin Commands (Owner Only)</b></summary>

- `start` - Activate bot
- `stop` - Deactivate bot
- `status` - Show bot statistics
- `whitelist [jid] [name]` - Add user to whitelist
- `listwhitelist` - Show whitelisted users
- `backup` - Create data backup
- `restore [filename]` - Restore from backup
- `cleararchives [keep_N]` - Clear old archives
</details>

---

## 🐛 Troubleshooting

### Bot Won't Connect?

```bash
# Delete auth folder and reconnect
rm -rf auth_info_baileys
npm start
# Scan QR code again
```

### Commands Not Working?

- Check if you're whitelisted: `Bot, listwhitelist` (owner only)
- Verify bot is active: `Bot, status` (owner only)
- Check command format matches examples

### Scheduled Wishes Not Sending?

- **Is bot running?** Check your terminal/server
- **Is computer on?** Bot must run 24/7 (see [Hosting Options](#-hosting-options))
- **Correct date/time format?** Use DD/MM/YYYY and HH:MM
- **Wish in active list?** Check with `Bot, listwishes`

### Can't Find Sent Wishes?

Sent wishes are automatically archived! View them with:

```
Bot, listarchives sent
```

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Quick steps:**

1. Fork the repo
2. Create branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m "feat: add amazing feature"`
4. Push: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

This project is licensed under **GNU Affero General Public License v3.0** (AGPL-3.0).

**TL;DR:**

- ✅ Use for personal/commercial purposes
- ✅ Modify and distribute
- ❌ Cannot sell closed-source versions
- ✔️ Must share modifications
- ✔️ Must keep open source

Full license: [LICENSE](LICENSE)

---

## ⚠️ Disclaimer

**Not affiliated with WhatsApp Inc.** Use responsibly and follow [WhatsApp's Terms of Service](https://www.whatsapp.com/legal/terms-of-service).

**Use for good:**

- ✅ Personal reminders and legitimate communication
- ✅ Birthday wishes and celebrations
- ❌ Don't spam or harass
- ❌ Don't send unsolicited messages

---

## 🙏 Credits

- [Baileys](https://github.com/WhiskeySockets/Baileys) - WhatsApp Web API
- [node-cron](https://github.com/node-cron/node-cron) - Scheduling
- All contributors and users

---
## 📞 Support
- 🐛 **Issues:** [GitHub Issues](https://github.com/TheStoicSpirit/Whatsapp-Wishing-Bot/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/TheStoicSpirit/Whatsapp-Wishing-Bot/discussions)
---

## ⭐ Show Your Support

If Birthday Bot helps you never miss a birthday, please:

- ⭐ Star this repo
- 🍴 Fork and contribute
- 📢 Share with friends
- 🐛 Report bugs

---

<div align="center">

**Made with ❤️ for everyone who forgets birthdays**

**Never be late to wish again!** 🎂🎉

[![GitHub Stars](https://img.shields.io/github/TheStoicSpirit/Whatsapp-Wishing-Bot/?style=social)](https://github.com/TheStoicSpirit/Whatsapp-Wishing-Bot/)

</div>
