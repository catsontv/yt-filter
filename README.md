# YouTube Monitor - Desktop App

> A Windows desktop application for parents to monitor and manage YouTube usage across multiple devices

## 🚨 IMPORTANT - Critical Fix Applied (Dec 3, 2025)

**Database synchronization issue has been FIXED!**

If you previously tested Phase 1 and experienced issues with data not appearing:

1. **Pull the latest changes:**
   ```bash
   git pull origin phase-1-core-desktop-app
   ```

2. **Follow the quick start guide:**
   - [QUICK_START_AFTER_FIX.md](desktop-app/QUICK_START_AFTER_FIX.md)

3. **Read what was fixed:**
   - [FIX_SUMMARY.md](desktop-app/FIX_SUMMARY.md) - Executive overview
   - [CRITICAL_FIX_APPLIED.md](desktop-app/CRITICAL_FIX_APPLIED.md) - Technical details

**The app now works perfectly - data synchronizes immediately between API and UI!**

---

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
           ⇕️ REST API
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
- 🌍 **Remote Access** - Works even when kids are away from home
- 🔔 **Alerts** - Get notified when extension is disabled or blocks are attempted
- 🎨 **Clean UI** - Light/dark mode, simple and intuitive

### For Kids (Chrome Extension)
- Transparent monitoring (they know they're being tracked)
- Clear block messages explaining why content is restricted
- Can't seek/skip in videos (disabled timeline/progress bar)
- Protected with parent password

## 🚀 Quick Start (Phase 1 Testing)

### Prerequisites
- Windows 10/11
- Node.js 18+ installed
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/catsontv/yt-filter.git
cd yt-filter

# Checkout Phase 1 branch
git checkout phase-1-core-desktop-app

# Install and run
cd desktop-app
npm install
npm start
```

### Testing

Once the app is running, open a new PowerShell window:

```powershell
cd desktop-app
.\test-api.ps1
```

**You should see:**
- Dashboard updates within 5 seconds
- 1 device registered
- 3 sample videos with thumbnails
- All data persists after restart

### Need Help?

See the comprehensive guides:
- [QUICK_START_AFTER_FIX.md](desktop-app/QUICK_START_AFTER_FIX.md) - Step-by-step testing
- [PHASE1_TESTING_GUIDE.md](PHASE1_TESTING_GUIDE.md) - Complete testing checklist

## 📁 Project Structure

```
yt-filter/
├── desktop-app/          # Electron desktop application
│   ├── src/
│   │   ├── main/        # Electron main process
│   │   ├── api/         # REST API server
│   │   ├── database/    # SQLite operations
│   │   └── renderer/    # React UI
│   ├── resources/       # Icons, binaries
│   ├── FIX_SUMMARY.md   # What was fixed
│   ├── CRITICAL_FIX_APPLIED.md  # Technical details
│   └── QUICK_START_AFTER_FIX.md # Testing guide
│
├── extension/           # Chrome extension (Phase 2)
│   ├── manifest.json
│   ├── content.js
│   ├── background.js
│   └── config.js
│
├── docs/                # Documentation
├── DEVELOPMENT_PLAN.md  # Phased development roadmap
├── PHASE1_TESTING_GUIDE.md  # Complete test suite
└── README.md           # This file
```

## 🛠️ Development Status

**Current Phase:** Phase 1 - Core Desktop App (✅ COMPLETE & TESTED)

### Phase 1 Deliverables (✓ All Working)
- ✅ Electron app with React UI
- ✅ SQLite database with all tables
- ✅ REST API server (localhost:3000)
- ✅ 5-page UI (Dashboard, Watch History, Blocks, Devices, Settings)
- ✅ Device registration
- ✅ Watch history tracking
- ✅ Data persistence
- ✅ Auto-refresh (5 second interval)
- ✅ Light/dark theme toggle
- ✅ System tray integration

**Next Phase:** Phase 2 - Chrome Extension Development

See [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) for complete roadmap.

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
- Enterprise-grade security:
  - Helmet security headers
  - Rate limiting
  - Input validation
  - API key authentication
  - CORS restrictions

## 📝 Technical Details

**Desktop App:**
- Electron 33.4+ (latest stable)
- React (UI components)
- SQLite via sql.js (database)
- Express 4.19+ (REST API)
- bcryptjs (password hashing)
- Helmet + express-rate-limit (security)

**Chrome Extension:**
- Manifest V3
- Tracks YouTube activity
- Enforces blocks client-side
- Password-protected

## 🤝 Contributing

This is a personal project, but suggestions and bug reports are welcome via [Issues](https://github.com/catsontv/yt-filter/issues).

## 📝 Testing

Comprehensive testing guides available:

1. **[QUICK_START_AFTER_FIX.md](desktop-app/QUICK_START_AFTER_FIX.md)** - 3-command quick start
2. **[PHASE1_TESTING_GUIDE.md](PHASE1_TESTING_GUIDE.md)** - Complete 13-test checklist
3. **[CRITICAL_FIX_APPLIED.md](desktop-app/CRITICAL_FIX_APPLIED.md)** - Troubleshooting guide

All tests now pass with the database synchronization fix!

## 💻 Recent Changes

### December 3, 2025 - Critical Fix
- ✅ Fixed database synchronization issue
- ✅ API writes now immediately visible in UI
- ✅ Eliminated race conditions
- ✅ Added comprehensive documentation
- ✅ All Phase 1 tests passing

**Commits:**
- [94bf8cd](https://github.com/catsontv/yt-filter/commit/94bf8cd32b82755cda6b6731c200da8754a28c45) - Executive summary
- [7e847fd](https://github.com/catsontv/yt-filter/commit/7e847fd36bde71d3621a262c8d5fd1b5c3ca09b0) - Quick start guide
- [5639c92](https://github.com/catsontv/yt-filter/commit/5639c92652ee0477840d40d6ac20c06e1cc9e5e4) - Technical docs
- [9f5a628](https://github.com/catsontv/yt-filter/commit/9f5a6286e4f07a1d0f121025ad7c4da341723cf1) - Database overhaul

## 📝 License

MIT License - See [LICENSE](LICENSE) for details.

## 🔗 Links

- [Development Plan](DEVELOPMENT_PLAN.md) - Phased roadmap
- [Phase 1 Testing Guide](PHASE1_TESTING_GUIDE.md) - Complete test suite
- [Quick Start After Fix](desktop-app/QUICK_START_AFTER_FIX.md) - Get started now
- [Issues](https://github.com/catsontv/yt-filter/issues) - Bug reports & feature requests
- [Releases](https://github.com/catsontv/yt-filter/releases) - Download installers

---

**Status:** ✅ Phase 1 Complete & Working  
**Branch:** [phase-1-core-desktop-app](https://github.com/catsontv/yt-filter/tree/phase-1-core-desktop-app)  
**Platform:** Windows (Phase 1), Android (Phase 2+)  
**Last Updated:** December 3, 2025
