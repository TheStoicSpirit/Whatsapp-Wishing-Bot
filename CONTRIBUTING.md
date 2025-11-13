# Contributing to Birthday Bot 🎉

Thanks for your interest in contributing! This guide will help you get started quickly.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- Git
- GitHub account
- Code editor (VS Code recommended)

### Setup

```bash
# 1. Fork the repo on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/Whatsapp-Wishing-Bot/.git
cd whatsapp-wishing-bot

# 3. Install dependencies
npm install

# 4. Copy and edit .env
cp .env.example .env
# Add your test WhatsApp number

# 5. Run in dev mode
npm run dev
```

---

## 🤝 How to Contribute

### 🐛 Report Bugs

1. Check [existing issues](https://github.com/TheStoicSpirit/Whatsapp-Wishing-Bot/issues) first
2. Use the bug report template
3. Include: OS, Node version, steps to reproduce, expected vs actual behavior

### 💡 Suggest Features

1. Check if already suggested
2. Open an issue with "Feature Request" label
3. Explain the use case and benefits

### 💻 Submit Code

1. Create a branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test thoroughly
4. Commit: `git commit -m "feat: add feature"`
5. Push: `git push origin feature/your-feature`
6. Open a Pull Request

---

## 📝 Code Style

### Quick Rules

```javascript
// ✅ Good
const userName = "John";
let count = 0;

const greet = async (name) => {
  try {
    return `Hello, ${name}!`;
  } catch (error) {
    console.error(error);
  }
};

// ❌ Bad
var userName = "John"; // no var, missing semicolon
function greet(name) {
  return "Hello, " + name;
} // use arrow functions
```

### Key Points

- Use `const`/`let`, never `var`
- Arrow functions for callbacks
- Always use semicolons
- 2 spaces for indentation
- Descriptive variable names
- Try-catch for async operations
- Add comments for complex logic

---

## 📋 Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add recurring wish feature
fix: resolve date parsing crash
docs: update installation guide
refactor: optimize archive lookup
```

**Types:** feat, fix, docs, style, refactor, test, chore

---

## 🔄 Pull Request Process

### Before Submitting

- ✅ Code follows style guide
- ✅ Changes are tested
- ✅ Documentation updated
- ✅ No console warnings
- ✅ Commit messages follow convention

### PR Template

```markdown
## Description

Brief description of changes

## Type

- [ ] Bug fix
- [ ] New feature
- [ ] Documentation

## Testing

How you tested the changes

## Checklist

- [ ] Code follows style guide
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tested thoroughly
```

---

## 🎯 Adding New Commands

**Quick Template:**

```javascript
// src/commands/implementations/myCommand.js
const BaseCommand = require("../baseCommand");

class MyCommand extends BaseCommand {
  async execute(message, args) {
    const senderId = message.key.remoteJid;

    // Check permissions
    if (!this.isWhitelisted(senderId)) {
      await this.sendMessage(senderId, "❌ Not authorized");
      return;
    }

    // Validate args
    if (args.length < 1) {
      await this.sendMessage(senderId, "❌ Usage: mycommand [arg]");
      return;
    }

    // Your logic
    try {
      const result = await this.doSomething(args[0]);
      await this.sendMessage(senderId, `✅ ${result}`);
    } catch (error) {
      console.error("Error:", error);
      await this.sendMessage(senderId, "❌ Failed");
    }
  }
}

module.exports = MyCommand;
```

**Register in `commandManager.js`:**

```javascript
const MyCommand = require("./implementations/myCommand");
this.commands.set("mycommand", new MyCommand(...));
```

**Add to `helpCommand.js`:**

```javascript
helpText += `${config.COMMAND_PREFIX} mycommand [arg] - Description\n`;
```

---

## ✅ Review Process

1. **Automated checks** (if configured)
2. **Maintainer review** (within 48-72 hours)
3. **Feedback** and requested changes
4. **Approval** and merge

---

## 🌟 Recognition

Contributors are recognized in:

- README Contributors section
- CHANGELOG for their contributions
- GitHub contributors page

**Every contribution matters** - even fixing typos! 🙏

---

## 🆘 Need Help?

- 💬 [GitHub Discussions](https://github.com/TheStoicSpirit/Whatsapp-Wishing-Bot/discussions)
- 🐛 [GitHub Issues](https://github.com/TheStoicSpirit/Whatsapp-Wishing-Bot/issues)

---

## 📄 License

By contributing, you agree your contributions will be licensed under AGPL v3.0.

---

**Thank you for making Birthday Bot better!** 🎂✨
