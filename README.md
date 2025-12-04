# YouTube Monitor - Desktop App

> A Windows desktop application for parents to monitor and manage YouTube usage across multiple devices

## 🎯 What Is This?

YouTube Monitor is a comprehensive system for parents who want to:
- Track what their kids watch on YouTube
- Block specific videos, channels, or keywords (Phase 3+)
- Set time limits and schedules (Phase 4+)
- Monitor usage remotely (Phase 6+)
- Manage multiple devices from one dashboard

**This is NOT about hiding monitoring - it's about responsible digital parenting with transparency.**

---

## 🆕 PHASE 2 - EXTENSION INTEGRATION COMPLETE! ✅

**New in Phase 2:**
- ✅ Chrome extension that tracks YouTube watch history
- ✅ Automatic device registration
- ✅ Real-time heartbeat monitoring (online/offline status)
- ✅ Watch history syncs every 10 minutes
- ✅ Video thumbnails and metadata display
- ✅ Extension popup with manual sync button
- ✅ Complete testing guide with 15 tests

**What Works Now:**
1. Install extension on Chrome
2. Visit YouTube - device auto-registers
3. Watch videos - they appear in desktop app
4. See device status (online/offline) in dashboard
5. View watch history with thumbnails

See **[PHASE2_TESTING_GUIDE.md](PHASE2_TESTING_GUIDE.md)** for complete testing instructions!

---

## 🚀 Quick Start - Phase 2

### Step 1: Clone and Setup Desktop App

```bash
# Clone repository
git clone https://github.com/catsontv/yt-filter.git
cd yt-filter

# Checkout Phase 2 branch
git checkout phase-2-extension-integration

# Install and run desktop app
cd desktop-app
npm install
npm start
```

Desktop app will start on http://localhost:3000

### Step 2: Install Chrome Extension

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the `yt-filter/extension/` folder
6. Extension icon should appear in toolbar

### Step 3: Test It!

1. Click extension icon → should show "Connected to Desktop App"
2. Visit https://www.youtube.com
3. Watch any video
4. Check desktop app **Watch History** page
5. Video should appear within 10 seconds (or click "Sync Now" in extension)

**See full testing guide:** [PHASE2_TESTING_GUIDE.md](PHASE2_TESTING_GUIDE.md)

---

## 🏛️ Architecture

```
┌─────────────────────────────────┐
│  Desktop App (Windows)          │
│  Runs on Parent's Computer      │
│                                 │
│  • Electron + React UI          │
│  • SQLite Database              │
│  • Express REST API             │
│  • Cloudflare Tunnel (Phase 6)  │
└─────────────────────────────────┘
           ⇕️ REST API
┌─────────────────────────────────┐
│  Chrome Extension ✅            │
│  Installed on Kid's Device      │
│                                 │
│  • Tracks watch history         │
│  • Enforces blocks (Phase 3+)   │
│  • Reports to desktop app       │
│  • Heartbeat monitoring         │
└─────────────────────────────────┘
```

---

## ✨ Features Status

### Phase 1: Core Desktop App ✅ COMPLETE
- ✅ Electron app with React UI
- ✅ SQLite database
- ✅ REST API server (localhost:3000)
- ✅ 5-page UI (Dashboard, Watch History, Blocks, Devices, Settings)
- ✅ Light/dark theme toggle
- ✅ System tray integration
- ✅ Auto-refresh every 5 seconds

### Phase 2: Extension Integration ✅ COMPLETE
- ✅ Chrome extension (Manifest V3)
- ✅ Auto-registration on first YouTube visit
- ✅ Watch history tracking
- ✅ Video metadata extraction (title, channel, thumbnail)
- ✅ Automatic sync every 10 minutes
- ✅ Manual sync button
- ✅ Heartbeat monitoring (every 60 seconds)
- ✅ Online/offline device detection
- ✅ Extension popup UI
- ✅ Local buffering (up to 100 videos)

### Phase 3: Basic Blocking 🕒 NEXT
- ⚪ Block videos and channels
- ⚪ Block overlay in extension
- ⚪ Custom block messages
- ⚪ Block attempt tracking

### Phase 4: Advanced Blocking 🕒 PLANNED
- ⚪ Keyword blocking
- ⚪ Time-based rules
- ⚪ Daily time limits

### Phase 5: Security & Protection 🕒 PLANNED
- ⚪ Password protection
- ⚪ Incognito detection
- ⚪ Tamper alerts
- ⚪ Notification system

### Phase 6: Remote Access 🕒 PLANNED
- ⚪ Cloudflare Tunnel integration
- ⚪ Remote monitoring

### Phase 7: Polish & Release 🕒 PLANNED
- ⚪ Professional UI
- ⚪ Installer with auto-updater
- ⚪ Complete documentation

---

## 📁 Project Structure

```
yt-filter/
├── desktop-app/          # Electron desktop application ✅
│   ├── src/
│   │   ├── main/        # Electron main process
│   │   ├── api/         # REST API server
│   │   ├── database/    # SQLite operations
│   │   └── renderer/    # React UI
│   └── package.json
│
├── extension/            # Chrome extension ✅ NEW
│   ├── manifest.json
│   ├── background.js     # Service worker
│   ├── content.js        # YouTube page detection
│   ├── popup.html        # Extension popup
│   ├── popup.js
│   ├── config.js
│   └── README.md         # Extension docs
│
├── docs/                # Documentation
├── DEVELOPMENT_PLAN.md  # Phased roadmap
├── PHASE1_TESTING_GUIDE.md
├── PHASE2_TESTING_GUIDE.md  ✅ NEW
├── PHASE2_README.md     ✅ NEW
└── README.md            # This file
```

---

## 🧪 Testing

### Phase 2 Complete Test Suite

See **[PHASE2_TESTING_GUIDE.md](PHASE2_TESTING_GUIDE.md)** for:
- 15 detailed test cases
- Performance tests
- Edge case scenarios  
- Troubleshooting guide
- Expected pass/fail criteria

### Quick Verification (2 minutes)

```bash
# 1. Start desktop app
cd desktop-app
npm start

# 2. Install extension in Chrome
# (see Quick Start above)

# 3. Visit YouTube and watch a video

# 4. Check desktop app Watch History page
# Should see video with thumbnail within 10 seconds
```

---

## 🔒 Privacy & Security

### What We Track
- Video ID, title, channel name
- Video thumbnail URL
- Timestamp when video page was accessed
- Device info (browser, OS)

### What We DON'T Track
- How long you watched (watch duration)
- Search queries
- Comments or likes  
- Private browsing (incognito)
- Anything outside YouTube

### Data Storage
- All data stored locally on parent's computer (SQLite)
- Optional remote access via encrypted Cloudflare tunnel (Phase 6)
- **No third-party data sharing**
- **No cloud storage**
- Open source - you can audit the code

---

## 🛠️ Technical Details

**Desktop App:**
- Electron 33.4+
- React (UI components)
- SQLite via sql.js
- Express 4.19+ (REST API)
- bcryptjs (password hashing)
- Helmet + express-rate-limit (security)

**Chrome Extension:**
- Manifest V3
- Service Worker (background)
- Content Script (YouTube detection)
- Chrome Storage API
- Chrome Alarms API

**API Endpoints (Phase 1+2):**
- `POST /api/v1/register` - Register device
- `POST /api/v1/watch-history` - Submit watch history
- `GET /api/v1/heartbeat/:device_id` - Heartbeat ping
- `GET /api/v1/blocks/:device_id` - Get blocks (Phase 3)

---

## 📝 Development Status

**Current Phase:** Phase 2 - Extension Integration ✅ COMPLETE

**Commits:**
- [Extension core files](https://github.com/catsontv/yt-filter/commit/e945a12d18d60e40486a3a4f8a2d58c83f7b513f)
- [Testing guide and docs](https://github.com/catsontv/yt-filter/commit/d7174a1ca742c3ed0249abd464d4d7c84a90983c)

**Next Phase:** Phase 3 - Basic Blocking (2-3 days)

See [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) for complete roadmap.

---

## ⚠️ Known Limitations (Phase 2)

### Extension
- ❌ No content blocking yet (Phase 3)
- ❌ No keyword filtering (Phase 4)  
- ❌ No time restrictions (Phase 4)
- ❌ No password protection (Phase 5)
- ❌ No incognito detection (Phase 5)
- ❌ Icons need to be generated (see extension/icons/ICONS_INFO.md)

### Desktop App
- ❌ No block management UI (Phase 3)
- ❌ No time rules UI (Phase 4)
- ❌ No alert system (Phase 5)
- ❌ No remote access (Phase 6)

---

## 🐛 Troubleshooting

### Extension won't load
- Check Chrome version (needs 88+)
- Enable Developer Mode in chrome://extensions/
- Verify all files are in extension folder
- Look for errors in chrome://extensions/

### Device not appearing in desktop app  
- Ensure desktop app is running (http://localhost:3000)
- Visit YouTube explicitly (not just install extension)
- Check service worker console for errors
- Try reloading extension

### Videos not syncing
- Check extension popup for buffer count
- Try manual "Sync Now" button
- Verify desktop app is accessible
- Check service worker console for errors
- Ensure desktop app auto-refresh is working (every 5s)

### Device shows offline
- Check if extension is enabled  
- Verify heartbeat in service worker console
- Ensure desktop app is running
- Wait 60 seconds for next heartbeat

See [PHASE2_TESTING_GUIDE.md](PHASE2_TESTING_GUIDE.md) for more troubleshooting.

---

## 🤝 Contributing

This is a personal project, but suggestions and bug reports are welcome via [Issues](https://github.com/catsontv/yt-filter/issues).

---

## 📝 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 🔗 Links

- [Development Plan](DEVELOPMENT_PLAN.md) - Complete 7-phase roadmap
- [Phase 1 Testing](PHASE1_TESTING_GUIDE.md) - Desktop app tests
- [Phase 2 Testing](PHASE2_TESTING_GUIDE.md) - Extension tests ✅ NEW
- [Phase 2 README](PHASE2_README.md) - Phase 2 summary ✅ NEW
- [Extension README](extension/README.md) - Extension docs ✅ NEW
- [Issues](https://github.com/catsontv/yt-filter/issues) - Bug reports
- [Releases](https://github.com/catsontv/yt-filter/releases) - Downloads

---

**Current Status:** ✅ Phase 2 Complete - Extension Integration Working  
**Branch:** [phase-2-extension-integration](https://github.com/catsontv/yt-filter/tree/phase-2-extension-integration)  
**Platform:** Windows Desktop + Chrome Extension  
**Last Updated:** December 4, 2025

---

### 🎉 What's Working Right Now

1. ✅ Desktop app shows devices online/offline
2. ✅ Extension tracks every YouTube video watched
3. ✅ Watch history displays with thumbnails
4. ✅ Heartbeat monitoring updates every 60 seconds
5. ✅ Auto-sync every 10 minutes
6. ✅ Manual sync button in extension
7. ✅ All data persists in SQLite
8. ✅ Multi-device support
9. ✅ Real-time dashboard updates
10. ✅ Clean, professional UI with dark mode

**Ready to test? Follow the Quick Start guide above!**
