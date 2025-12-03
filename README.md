# YouTube Monitor - Desktop App

> A Windows desktop application for parents to monitor and manage YouTube usage across multiple devices

## 🎯 What Is This?

YouTube Monitor is a comprehensive system for parents who want to:
- Track what their kids watch on YouTube
- Block specific videos, channels, or keywords
- Set time limits and schedules
- Monitor usage remotely (even when kids are away from home)
- Manage multiple devices from one dashboard

**This is NOT about hiding monitoring - it's about responsible digital parenting with transparency.**

## 🏗️ Architecture

```
┌─────────────────────────────────┐
│  Desktop App (Windows)          │
│  Runs on Parent's Computer      │
│                                 │
│  • Electron + React UI          │
│  • SQLite Database              │
│  • Express REST API             │
│  • Cloudflare Tunnel (optional) │
└─────────────────────────────────┘
           ↕️ REST API
┌─────────────────────────────────┐
│  Chrome Extension               │
│  Installed on Kid's Device      │
│                                 │
│  • Tracks watch history         │
│  • Enforces blocks              │
│  • Reports to desktop app       │
└─────────────────────────────────┘
```

## ✨ Key Features

### For Parents (Desktop App)
- 📊 **Dashboard** - See all YouTube activity at a glance
- 🎬 **Watch History** - Full details with thumbnails, titles, channels
- 🚫 **Smart Blocking**
  - Block specific videos or entire channels
  - Keyword blocking (e.g., "fortnite")
  - Time-based rules (e.g., no YouTube during school hours)
  - Daily time limits (e.g., max 2 hours/day)
- 📱 **Multi-Device** - Manage multiple kids' devices
- 🌐 **Remote Access** - Works even when kids are away from home
- 🔔 **Alerts** - Get notified when extension is disabled or blocks are attempted
- 🎨 **Clean UI** - Light/dark mode, simple and intuitive

### For Kids (Chrome Extension)
- Transparent monitoring (they know they're being tracked)
- Clear block messages explaining why content is restricted
- Can't seek/skip in videos (disabled timeline/progress bar)
- Protected with parent password

## 🚀 Installation

### Prerequisites
- Windows 10/11
- Chrome browser on kid's device

### Step 1: Install Desktop App (Parent's Computer)

1. Download `YouTubeMonitor-Setup.exe` from [Releases](https://github.com/catsontv/yt-filter/releases)
2. Run installer
3. Set admin password
4. Desktop app opens automatically

### Step 2: Install Extension (Kid's Device)

1. In desktop app, go to **Settings**
2. Click **"Download Extension"**
3. Install on kid's Chrome:
   - Open `chrome://extensions/`
   - Enable **Developer mode**
   - Click **Load unpacked**
   - Select downloaded folder
4. Extension auto-connects to desktop app

### Step 3: Enable Remote Access (Optional)

1. In desktop app, go to **Settings**
2. Toggle **"Enable Remote Access"**
3. Extension will work from anywhere (school, friends' houses, etc.)

## 📁 Project Structure

```
yt-filter/
├── desktop-app/          # Electron desktop application
│   ├── src/
│   │   ├── main/        # Electron main process
│   │   ├── api/         # REST API server
│   │   ├── database/    # SQLite operations
│   │   └── renderer/    # React UI
│   └── resources/       # Icons, binaries
│
├── extension/           # Chrome extension
│   ├── manifest.json
│   ├── content.js
│   ├── background.js
│   └── config.js
│
├── docs/                # Documentation
├── DEVELOPMENT_PLAN.md  # Phased development roadmap
└── README.md           # This file
```

## 🛠️ Development Status

**Current Phase:** Planning & Architecture  
**Next Phase:** Core Desktop App (Database + API + Basic UI)

See [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) for detailed roadmap.

## 🎯 Design Goals

1. **Simple for non-technical parents** - Download, install, done
2. **Transparent monitoring** - Kids know they're being tracked
3. **Robust but not invasive** - Monitor usage without spying
4. **Works remotely** - Not limited to home network
5. **Easy to test** - Each phase has testable features

## 🔒 Privacy & Security

- All data stored locally on parent's computer (SQLite)
- Optional remote access via encrypted Cloudflare tunnel
- No third-party data sharing
- Open source - you can audit the code

## 📝 Technical Details

**Desktop App:**
- Electron (cross-platform framework)
- React (UI)
- SQLite (database)
- Express (REST API)
- Cloudflare Tunnel (remote access)

**Chrome Extension:**
- Manifest V3
- Tracks YouTube activity
- Enforces blocks client-side
- Password-protected

## 🤝 Contributing

This is a personal project, but suggestions and bug reports are welcome via [Issues](https://github.com/catsontv/yt-filter/issues).

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

## 🔗 Links

- [Development Plan](DEVELOPMENT_PLAN.md) - Phased roadmap
- [Issues](https://github.com/catsontv/yt-filter/issues) - Bug reports & feature requests
- [Releases](https://github.com/catsontv/yt-filter/releases) - Download installers

---

**Status:** In Development  
**Platform:** Windows (Phase 1), Android (Phase 2+)  
**Last Updated:** November 29, 2025