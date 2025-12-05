# Phase 2 Setup Guide - For Non-Developers

> **You said you're NOT a developer and just want to download and test. This guide is for YOU!**

---

## 📦 What You Need to Download

You need to download TWO things:
1. **Desktop App** - Runs on your Windows computer
2. **Chrome Extension** - Installs in Chrome browser

Both are in the same repository, you just need to download once.

---

## 💻 Prerequisites

Before you start, make sure you have:

- ✅ **Windows 10 or 11** (64-bit)
- ✅ **Node.js 18 or newer** installed
  - Download from: https://nodejs.org/
  - Choose "LTS" version (recommended)
  - Install with default settings
- ✅ **Google Chrome** browser
- ✅ **Git** installed (to download the code)
  - Download from: https://git-scm.com/download/win
  - Install with default settings

**Verify Node.js is installed:**
```powershell
node --version
# Should show: v18.x.x or higher
```

---

## 🚀 Step-by-Step Installation

### Step 1: Download the Code

1. Open **PowerShell** (search for "PowerShell" in Start menu)
2. Navigate to where you want to download (e.g., Desktop):
   ```powershell
   cd Desktop
   ```

3. Download the code:
   ```powershell
   git clone https://github.com/catsontv/yt-filter.git
   cd yt-filter
   ```

4. Switch to Phase 2 branch:
   ```powershell
   git checkout phase-2-extension-integration
   ```

**What you'll see:**
```
Cloning into 'yt-filter'...
remote: Counting objects: 100%
Receiving objects: 100% (XXX/XXX)
Branch 'phase-2-extension-integration' set up to track remote branch
```

**You now have a folder called `yt-filter` on your Desktop!**

---

### Step 2: Install Desktop App

1. **Still in PowerShell**, navigate to desktop app folder:
   ```powershell
   cd desktop-app
   ```

2. **Install dependencies** (this downloads required packages):
   ```powershell
   npm install
   ```
   
   **This will take 2-3 minutes.** You'll see lots of text scrolling. That's normal!

3. **Start the desktop app**:
   ```powershell
   npm start
   ```

**What you'll see:**
- A window will pop up (the YouTube Monitor app)
- You'll see the Dashboard page
- PowerShell will show: "API Server running on port 3000"

✅ **Desktop app is now running!** Keep this PowerShell window open.

---

### Step 3: Install Chrome Extension

1. **Open Google Chrome**

2. **Go to extensions page:**
   - Type in address bar: `chrome://extensions/`
   - Press Enter

3. **Enable Developer Mode:**
   - Look at top right corner
   - Toggle **Developer mode** to ON (should turn blue)

4. **Load the extension:**
   - Click **"Load unpacked"** button (top left)
   - Navigate to your Desktop
   - Find `yt-filter` folder
   - Open `extension` folder inside it
   - Click **"Select Folder"**

**What you'll see:**
- Extension appears in the list
- Name: "YouTube Monitor"
- Version: 2.0.0
- A puzzle icon appears in Chrome toolbar

✅ **Extension is now installed!**

---

## 🧪 Testing Phase 2

### Quick Test (2 minutes)

1. **Click the extension icon** (puzzle piece in Chrome toolbar)
   - Should show a popup
   - Status: "Connected to Desktop App" (green)
   - Shows your Device ID and Device Name

2. **Visit YouTube:**
   - Open new tab
   - Go to https://www.youtube.com
   - Search for any video (e.g., "cute cats")
   - Click on a video

3. **Wait 10 seconds**, then:
   - Click extension icon again
   - Look at "Buffered Videos" - should say "1"
   - Click **"Sync Now"** button

4. **Check Desktop App:**
   - Switch to YouTube Monitor desktop app
   - Click **"Watch History"** in left sidebar
   - You should see your video with thumbnail!

✅ **If you see the video with thumbnail, Phase 2 is working!**

---

### Complete Testing

For thorough testing, follow: **[PHASE2_TESTING_GUIDE.md](PHASE2_TESTING_GUIDE.md)**

It includes:
- 15 detailed test cases
- What to expect at each step
- Troubleshooting if something goes wrong
- Performance tests
- Edge cases

---

## 📑 What Each Test Verifies

### Test 1: Extension Installation
- Verifies extension loads without errors
- Checks popup displays correctly

### Test 2: Auto-Registration  
- Device automatically registers with desktop app
- Device appears in dashboard

### Test 3: Watch History Tracking
- Extension detects when you watch videos
- Videos buffer locally

### Test 4: Watch History Sync
- Videos sync to desktop app
- Thumbnails display correctly

### Test 5: Automatic Sync
- Sync happens automatically every 10 minutes
- No manual action needed

### Test 6: Thumbnails Display
- All video thumbnails load
- Images are clear and correct

### Test 7: Device Online Status
- Desktop app shows device as "Online"
- Status updates in real-time

### Test 8: Device Offline Detection
- Disable extension → shows "Offline"
- Re-enable → back to "Online"

### Test 9: Multiple Videos
- Watch 10 videos → all appear correctly
- No duplicates or missing videos

### Test 10: Buffer Overflow
- Edge case: 100+ videos buffer correctly

### Test 11: Data Persistence
- Restart desktop app → data still there
- No data loss

### Test 12: Clickable URLs
- Click video title → opens on YouTube

### Test 13: Channel Information
- Channel names display correctly

### Test 14: Devices Page
- Devices list shows all registered devices
- Online/offline status for each

### Test 15: Dashboard Statistics  
- Dashboard shows correct counts
- Device status updates

---

## ✅ Success Checklist

Phase 2 is **working correctly** if:

- [ ] Desktop app starts without errors
- [ ] Extension loads in Chrome without errors  
- [ ] Extension popup shows "Connected"
- [ ] Device appears in desktop app dashboard
- [ ] Device shows as "Online" (green)
- [ ] Watch a video → appears in Watch History
- [ ] Video has thumbnail, title, channel name
- [ ] Video URL is clickable
- [ ] Timestamp is correct
- [ ] Multiple videos all appear
- [ ] Auto-sync works (wait 10 minutes)
- [ ] Manual sync works (click "Sync Now")
- [ ] Disable extension → device goes "Offline"
- [ ] Re-enable extension → device back "Online"
- [ ] Data persists after restarting desktop app

If **all checkboxes are checked**, Phase 2 is ✅ COMPLETE!

---

## 🐛 Common Issues & Fixes

### Issue: "npm is not recognized"

**Problem:** Node.js not installed or not in PATH

**Fix:**
1. Download Node.js from https://nodejs.org/
2. Install with default settings
3. Close and reopen PowerShell
4. Try again: `npm --version`

---

### Issue: Desktop app won't start

**Problem:** Dependencies not installed

**Fix:**
```powershell
cd desktop-app
rm -r node_modules
npm install
npm start
```

---

### Issue: "Port 3000 already in use"

**Problem:** Another app is using port 3000

**Fix:**
1. Close any other apps using port 3000
2. Or restart computer
3. Try starting desktop app again

---

### Issue: Extension shows "Not Connected"

**Problem:** Desktop app not running

**Fix:**
1. Make sure desktop app is running
2. Check PowerShell shows "API Server running on port 3000"
3. Test API: Open browser to http://localhost:3000
4. Should see: `{"status":"ok", ...}`
5. Reload extension: chrome://extensions/ → Reload button

---

### Issue: Videos not appearing in desktop app

**Problem:** Sync hasn't happened yet or failed

**Fix:**
1. Click extension icon
2. Check "Buffered Videos" count
3. Click **"Sync Now"** button
4. Wait 5 seconds
5. Refresh desktop app Watch History page

**Still not working?**
- Check service worker console:
  - chrome://extensions/ → YouTube Monitor → "service worker"
  - Look for errors in console
- Check desktop app console (PowerShell window)
  - Look for POST /api/v1/watch-history requests

---

### Issue: Extension won't load

**Problem:** Missing files or Chrome version too old

**Fix:**
1. Check Chrome version: chrome://settings/help
   - Needs Chrome 88 or newer
2. Verify all files in extension folder:
   - manifest.json
   - background.js  
   - content.js
   - popup.html
   - popup.js
   - config.js
3. Check chrome://extensions/ for error messages
4. Try reloading: Click "Reload" button

---

### Issue: Thumbnails not loading

**Problem:** Image URLs blocked or CSP issue

**Fix:**
1. Right-click broken image → "Open image in new tab"
2. If 404 error: YouTube changed thumbnail URL format
3. Check desktop app console for errors
4. Verify thumbnail URLs look like:
   `https://i.ytimg.com/vi/{VIDEO_ID}/mqdefault.jpg`

---

### Issue: Device always shows "Offline"

**Problem:** Heartbeat not working

**Fix:**
1. Check extension is enabled: chrome://extensions/
2. Click extension icon → check status
3. Check service worker console for heartbeat messages:
   - Should see "Heartbeat sent successfully" every 60 seconds
4. Verify desktop app is accessible:
   - Open: http://localhost:3000/api/v1/heartbeat/test
   - Should return 200 OK
5. Wait 60 seconds for next heartbeat
6. Refresh desktop app dashboard

---

## 🔄 How to Update to Latest Changes

If Phase 2 branch gets updated:

```powershell
cd Desktop/yt-filter
git pull origin phase-2-extension-integration
cd desktop-app
npm install
npm start
```

For extension updates:
1. chrome://extensions/
2. Find YouTube Monitor  
3. Click **Reload** button

---

## 🛡️ Stopping the App

### Stop Desktop App:
1. Go to PowerShell window
2. Press `Ctrl + C`
3. Close the desktop app window

### Disable Extension:
1. chrome://extensions/
2. Toggle YouTube Monitor to OFF

### Uninstall Extension:
1. chrome://extensions/
2. Click **Remove** button on YouTube Monitor

---

## 📋 Next Steps After Testing

Once all Phase 2 tests pass:

1. ✅ **Phase 2 Complete!**
2. Report results (if testing for someone)
3. Ready for Phase 3: Basic Blocking
   - Block videos and channels
   - Block overlay in extension
   - Block attempt tracking

---

## 📞 Support

If you're stuck:

1. **Check troubleshooting section above**
2. **Review testing guide:** [PHASE2_TESTING_GUIDE.md](PHASE2_TESTING_GUIDE.md)
3. **Check console logs:**
   - Desktop app: PowerShell window
   - Extension: chrome://extensions/ → service worker
4. **Open GitHub issue:** https://github.com/catsontv/yt-filter/issues

---

## 🎉 Success!

If you've made it here and all tests pass:

🎊 **Congratulations!** 🎊

You've successfully:
- ✅ Installed the desktop app
- ✅ Installed the Chrome extension  
- ✅ Connected them together
- ✅ Verified watch history tracking works
- ✅ Tested online/offline detection
- ✅ Confirmed data persistence

**Phase 2 is fully functional and ready for real-world use!**

The extension will now:
- Track all YouTube videos watched
- Sync to desktop app every 10 minutes
- Show device status in real-time
- Store all data locally on your computer

---

**Last Updated:** December 4, 2025  
**Phase:** 2 - Extension Integration  
**Status:** ✅ Complete
