# Development Plan - YouTube Monitor Desktop App

> Phased approach with testable milestones at each stage

## Overview

This project is being built in **phases**, where each phase delivers **working, testable features**. No phase is "just code" - each one ends with something you can actually use and test.

---

## Phase 1: Core Desktop App (Foundation)
**Goal:** Desktop app that stores data and serves an API

### Features to Build
1. **Electron App Shell**
   - Window management (open, minimize, close)
   - System tray integration (minimize to tray)
   - Auto-start with Windows
   - Basic React UI with routing

2. **SQLite Database**
   - Create tables: `devices`, `watch_history`, `blocks`, `time_rules`, `settings`
   - Database initialization on first run
   - Basic CRUD operations

3. **REST API Server**
   - Express server running on `localhost:3000`
   - Endpoints:
     - `POST /api/v1/register` - Register device
     - `POST /api/v1/watch-history` - Receive watch history
     - `GET /api/v1/blocks/:device_id` - Get blocks for device
     - `GET /api/v1/heartbeat/:device_id` - Heartbeat ping
   - Authentication via API keys

4. **Basic UI Pages (Minimal but Functional)**
   - **Dashboard:** Shows "No devices yet" message
   - **Watch History:** Empty table with headers
   - **Blocks:** "No blocks yet" message + "Add Block" button (non-functional)
   - **Devices:** "No devices registered" message
   - **Settings:** 
     - Admin password setup (first run)
     - API URL display (http://localhost:3000)
     - Theme toggle (light/dark)

### How to Test Phase 1
✅ **App Launches:** Double-click .exe, app opens  
✅ **Password Setup:** First run prompts for password  
✅ **Navigation:** Can click between pages  
✅ **System Tray:** Minimize to tray, double-click to restore  
✅ **API Server:** Open `http://localhost:3000` in browser, see JSON response  
✅ **Database:** Check SQLite file exists in app data folder  
✅ **Theme Toggle:** Switch between light/dark mode  

### Deliverables
- ✅ Runnable desktop app (.exe installer)
- ✅ SQLite database with schema
- ✅ Working REST API (test with Postman/curl)
- ✅ Basic UI you can click through

### Estimated Time: 3-4 days

---

## Phase 2: Extension Integration (Connect the Pieces)
**Goal:** Chrome extension talks to desktop app, syncs watch history

### Features to Build
1. **Extension Configuration**
   - `config.js` with API URL (http://localhost:3000)
   - Device ID generation (UUID)
   - Registration flow on first run

2. **Watch History Tracking**
   - Detect YouTube video page loads
   - Extract video metadata (ID, title, channel, thumbnail, URL)
   - Store locally in extension storage
   - Sync to desktop app every 10 minutes

3. **Heartbeat Monitoring**
   - Extension pings desktop app every 60 seconds
   - Desktop app updates `last_heartbeat` timestamp

4. **Desktop App Updates**
   - **Dashboard:** Shows registered devices with online/offline status
   - **Watch History:** Table populated with real data (thumbnails, titles, clickable URLs)
   - **Devices:** List shows device name, last seen, online status

### How to Test Phase 2
✅ **Extension Installs:** Load unpacked in Chrome, no errors  
✅ **Auto-Registration:** First YouTube visit registers device in desktop app  
✅ **Watch Tracking:** Watch a YouTube video, appears in desktop app within 10 min  
✅ **Thumbnails Display:** Watch history shows video thumbnails  
✅ **Device Status:** Dashboard shows device as "Online" (green)  
✅ **Heartbeat:** Disable extension, desktop app shows "Offline" after 2 minutes  
✅ **Multiple Videos:** Watch 5 videos, all appear in watch history  

### Deliverables
- ✅ Chrome extension (.zip)
- ✅ Desktop app showing real watch data
- ✅ Device online/offline detection working

### Estimated Time: 2-3 days

---

## Phase 3: Basic Blocking (Core Feature)
**Goal:** Block videos and channels, show block overlay

### Features to Build
1. **Block Management UI**
   - **Add Block:** Paste YouTube URL, auto-extract video/channel ID
   - **Block List:** Table showing all blocks (video/channel name, date added)
   - **Delete Block:** Remove button
   - **Custom Message:** Optional field when adding block

2. **Block Enforcement (Extension)**
   - Fetch block list from desktop app on startup
   - Check current video/channel against block list
   - If blocked, show overlay:
     ```
     ⚠️ Content Restricted
     This video/channel has been blocked.
     Reason: [Custom message if provided]
     [Return to YouTube Home]
     ```
   - Log block attempt to desktop app

3. **Block Attempts Tracking**
   - Desktop app logs all block attempts
   - Dashboard shows "Block Attempts Today: X"

### How to Test Phase 3
✅ **Add Video Block:** Paste YouTube video URL, appears in block list  
✅ **Block Works:** Try to watch blocked video, shows overlay  
✅ **Custom Message:** Add block with message, message appears in overlay  
✅ **Channel Block:** Block entire channel, can't watch any videos from that channel  
✅ **Block Attempts Logged:** Try to access blocked content, counter increases in dashboard  
✅ **Unblock Works:** Delete block, video becomes accessible again  
✅ **Multiple Devices:** Block on desktop app, affects all registered devices  

### Deliverables
- ✅ Functional block management UI
- ✅ Extension enforces blocks
- ✅ Block overlay displays correctly
- ✅ Block attempts tracked

### Estimated Time: 2-3 days

---

## Phase 4: Advanced Blocking (Keywords + Time Rules)
**Goal:** Keyword blocking and time-based restrictions

### Features to Build
1. **Keyword Blocking**
   - Add keyword to block list (e.g., "fortnite")
   - Extension checks video titles against keywords
   - Case-insensitive, partial match
   - Block if keyword found in title

2. **Time-Based Rules UI**
   - **Add Time Block:** Select days (Mon-Sun) + hours (9 AM - 3 PM)
   - **Daily Time Limit:** Set max minutes per day (e.g., 120)
   - Visual schedule display

3. **Time Rule Enforcement (Extension)**
   - Check current time against time blocks
   - If blocked time, show overlay: "YouTube is blocked during school hours"
   - Track total watch time per day
   - If daily limit reached, show overlay: "Daily limit reached (2 hours)"
   - Reset counter at midnight

### How to Test Phase 4
✅ **Keyword Block:** Add "fortnite", any video with that word gets blocked  
✅ **Time Block:** Set 9 AM - 3 PM block, YouTube blocked during those hours  
✅ **Time Zone:** Time block uses correct local time  
✅ **Daily Limit:** Set 30-minute limit, YouTube blocks after 30 min of watching  
✅ **Limit Reset:** Limit resets at midnight, can watch again  
✅ **Weekday Rules:** Set Mon-Fri block, weekends unrestricted  

### Deliverables
- ✅ Keyword blocking working
- ✅ Time-based rules working
- ✅ Daily time limits enforced

### Estimated Time: 3-4 days

---

## Phase 5: Security & Protection (Tamper Prevention)
**Goal:** Prevent extension from being disabled or bypassed

### Features to Build
1. **Password Protection**
   - Extension settings require parent password
   - Password set in desktop app, synced to extension
   - Hash password (SHA-256)

2. **Incognito Detection**
   - Extension detects incognito mode
   - Blocks YouTube entirely in incognito
   - Shows: "Incognito mode detected - YouTube is disabled"
   - Logs attempt to desktop app

3. **Tamper Alerts**
   - Desktop app detects when heartbeat stops
   - Shows notification: "Device offline - extension may be disabled"
   - Optional email alert (if configured)

4. **Notifications System**
   - Windows toast notifications
   - Alert types:
     - Device offline (30+ minutes)
     - Multiple block attempts (5+ in 1 hour)
     - Incognito detection
   - Master toggle to disable all notifications

### How to Test Phase 5
✅ **Password Lock:** Try to access extension settings, requires password  
✅ **Wrong Password:** Enter wrong password, denied access  
✅ **Incognito Block:** Open YouTube in incognito, immediately blocked  
✅ **Incognito Alert:** Desktop app shows incognito attempt notification  
✅ **Disable Extension:** Disable extension in Chrome, desktop app shows offline alert  
✅ **Notification Toggle:** Disable notifications in settings, no alerts shown  
✅ **Multiple Attempts:** Try blocked video 6 times, get alert  

### Deliverables
- ✅ Password-protected extension
- ✅ Incognito mode blocked
- ✅ Alert system working
- ✅ Can disable notifications

### Estimated Time: 2-3 days

---

## Phase 6: Remote Access (Cloudflare Tunnel)
**Goal:** Desktop app works from anywhere, not just home network

### Features to Build
1. **Cloudflare Tunnel Integration**
   - Bundle `cloudflared.exe` with installer
   - Settings page: "Enable Remote Access" toggle
   - When enabled:
     - Starts cloudflared tunnel
     - Generates public URL (https://abc123.trycloudflare.com)
     - Shows URL in settings

2. **Extension URL Switching**
   - Extension checks desktop app API for remote URL
   - Automatically switches between localhost and remote URL
   - Seamless transition (no user action needed)

3. **Connection Status**
   - Desktop app shows "Remote Access: Active" or "Local Only"
   - Test connection button

### How to Test Phase 6
✅ **Enable Remote:** Toggle on in settings, tunnel starts  
✅ **URL Generated:** Public URL displayed in settings  
✅ **Extension Connects:** Extension connects to public URL  
✅ **Away From Home:** Take laptop to different network, extension still works  
✅ **Disable Remote:** Toggle off, switches back to localhost  
✅ **Tunnel Survives Restart:** Restart desktop app, tunnel restarts automatically  

### Deliverables
- ✅ Remote access working
- ✅ Extension works from anywhere
- ✅ Toggle on/off in settings

### Estimated Time: 2 days

---

## Phase 7: Polish & Release (Production Ready)
**Goal:** Professional, releasable product

### Features to Build
1. **UI Improvements**
   - Better icons and visual design
   - Loading states and error messages
   - Empty states with helpful messages
   - Tooltips and help text

2. **Enhanced Features**
   - Search and filter watch history
   - Sort by date, channel, duration
   - Quick block button next to each history entry
   - Device renaming ("Device-ABC" → "John's Laptop")
   - Per-device vs global blocks (checkbox)

3. **Data Management**
   - Settings: Data retention (default 30 days)
   - Manual "Delete All History" button
   - "Optimize Database" button

4. **Installer & Updates**
   - Windows installer with proper icons
   - Auto-updater (checks GitHub releases)
   - Uninstaller

5. **Documentation**
   - Setup guide with screenshots
   - FAQ
   - Troubleshooting section
   - Video tutorial

### How to Test Phase 7
✅ **Professional Look:** UI looks polished, not like a prototype  
✅ **Search Works:** Search watch history by title/channel  
✅ **Quick Block:** Click block button next to video, immediately blocked  
✅ **Device Rename:** Rename device, new name appears everywhere  
✅ **Per-Device Block:** Block video for one device, other devices unaffected  
✅ **Auto-Update:** New version releases, app shows update notification  
✅ **Clean Install:** Fresh install on new computer works perfectly  
✅ **Documentation:** Non-technical person can follow setup guide  

### Deliverables
- ✅ Polished, production-ready app
- ✅ Professional installer
- ✅ Complete documentation
- ✅ Auto-updater working
- ✅ Ready for public release

### Estimated Time: 4-5 days

---

## Phase 8: Android Support (Future)
**Goal:** Monitor YouTube on Android devices

*Details to be determined after Windows version is stable*

---

## Summary Timeline

| Phase | Description | Duration | Total |
|-------|-------------|----------|-------|
| 1 | Core Desktop App | 3-4 days | 4 days |
| 2 | Extension Integration | 2-3 days | 7 days |
| 3 | Basic Blocking | 2-3 days | 10 days |
| 4 | Advanced Blocking | 3-4 days | 14 days |
| 5 | Security & Protection | 2-3 days | 17 days |
| 6 | Remote Access | 2 days | 19 days |
| 7 | Polish & Release | 4-5 days | **~3-4 weeks total** |

---

## Testing Philosophy

**Every phase must be testable:**
- No "it compiles" - it must actually work
- Real user actions (click buttons, watch videos)
- Clear pass/fail criteria
- Manual testing by you between phases

**We don't move to next phase until current phase is working.**

---

## Current Status

**Phase:** Planning  
**Next:** Phase 1 - Core Desktop App  
**Progress:** 0% (Just starting!)  

---

*Last Updated: November 29, 2025*