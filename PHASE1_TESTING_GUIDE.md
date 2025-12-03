# Phase 1 Testing Guide - YouTube Monitor

> Complete step-by-step guide to install, run, and test Phase 1 features

## What You're Testing

Phase 1 delivers:
- ✅ Desktop app with Electron
- ✅ SQLite database
- ✅ REST API server on localhost:3000
- ✅ Basic UI with navigation
- ✅ System tray integration
- ✅ Password setup
- ✅ Theme toggle (light/dark)
- ✅ Auto-start with Windows

---

## Installation Steps

### Step 1: Download the Code

```bash
# Clone the repository and checkout the Phase 1 branch
git clone https://github.com/catsontv/yt-filter.git
cd yt-filter
git checkout phase-1-core-desktop-app

# Navigate to desktop app folder
cd desktop-app
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- Electron (desktop framework)
- Express (API server)
- Better-sqlite3 (database)
- Bcrypt (password hashing)
- Other dependencies

### Step 3: Run the App

```bash
npm start
```

The app should launch automatically!

---

## Testing Checklist

### Test 1: App Launches ✅

**What to do:**
1. Run `npm start`
2. App window should open

**Expected result:**
- Desktop app opens with a sidebar and main content area
- Should see "Welcome to YouTube Monitor" modal

**Status:** ☐ Pass / ☐ Fail

---

### Test 2: Password Setup ✅

**What to do:**
1. On first run, you'll see a password setup modal
2. Enter a password (at least 4 characters)
3. Confirm the password
4. Click "Set Password"

**Expected result:**
- Modal closes
- Dashboard page loads
- Shows "No devices yet" message

**Status:** ☐ Pass / ☐ Fail

---

### Test 3: Navigation ✅

**What to do:**
1. Click each menu item in the sidebar:
   - Dashboard
   - Watch History
   - Blocks
   - Devices
   - Settings

**Expected result:**
- Each page loads without errors
- Active menu item is highlighted
- Dashboard shows "No devices yet"
- Watch History shows "No watch history yet"
- Blocks shows "No blocks yet" with disabled "Add Block" button
- Devices shows "No devices registered"
- Settings shows all configuration options

**Status:** ☐ Pass / ☐ Fail

---

### Test 4: System Tray ✅

**What to do:**
1. Minimize the app window (click X button)
2. Look for YouTube Monitor icon in system tray (bottom-right of Windows taskbar)
3. Right-click the tray icon
4. Double-click the tray icon

**Expected result:**
- App minimizes to tray instead of closing
- Right-click shows menu with "Show App" and "Quit"
- Double-click restores the app window

**Status:** ☐ Pass / ☐ Fail

---

### Test 5: API Server Running ✅

**What to do:**
1. Keep the app running
2. Open a web browser
3. Go to: `http://localhost:3000`

**Expected result:**
- Browser shows JSON response:
```json
{
  "name": "YouTube Monitor API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {
    "POST /api/v1/register": "Register a new device",
    "POST /api/v1/watch-history": "Submit watch history",
    "GET /api/v1/blocks/:device_id": "Get blocks for device",
    "GET /api/v1/heartbeat/:device_id": "Send heartbeat"
  }
}
```

**Status:** ☐ Pass / ☐ Fail

---

### Test 6: Database Created ✅

**What to do:**
1. Open File Explorer
2. Navigate to: `%APPDATA%/youtube-monitor/`
   - Or type: `C:\Users\YourUsername\AppData\Roaming\youtube-monitor\`
3. Look for `youtube-monitor.db` file

**Expected result:**
- Database file exists
- File size is greater than 0 KB

**Status:** ☐ Pass / ☐ Fail

---

### Test 7: Theme Toggle ✅

**What to do:**
1. Go to Settings page
2. Find "Theme" section
3. Toggle the switch

**Expected result:**
- Toggle switch works smoothly
- When ON (checked): Dark mode activates (dark backgrounds)
- When OFF (unchecked): Light mode activates (light backgrounds)
- Theme persists after closing and reopening the app

**Status:** ☐ Pass / ☐ Fail

---

### Test 8: Password Change ✅

**What to do:**
1. Go to Settings page
2. Fill in:
   - Current Password: (your initial password)
   - New Password: `newpassword123`
   - Confirm New Password: `newpassword123`
3. Click "Change Password"

**Expected result:**
- Shows "Password changed successfully" alert
- Form fields clear
- Next time you run the app, the new password should work

**Status:** ☐ Pass / ☐ Fail

---

### Test 9: API Endpoints with Postman/curl ✅

**What to do:**
Test the API endpoints using Postman or curl:

#### Register a Device:
```bash
curl -X POST http://localhost:3000/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{"device_id":"test-device-123","device_name":"Test Device"}'
```

**Expected result:**
```json
{
  "device_id": "test-device-123",
  "api_key": "<generated-uuid>",
  "message": "Device registered successfully"
}
```

#### Send Heartbeat:
```bash
curl -X GET http://localhost:3000/api/v1/heartbeat/test-device-123 \
  -H "x-api-key: <your-api-key-from-previous-step>"
```

**Expected result:**
```json
{
  "device_id": "test-device-123",
  "timestamp": 1234567890,
  "status": "ok"
}
```

**Status:** ☐ Pass / ☐ Fail

---

### Test 10: Device Shows in Dashboard ✅

**What to do:**
1. After registering a device (Test 9)
2. Go back to the app
3. Click "Dashboard" in sidebar
4. Click "Devices" in sidebar

**Expected result:**
- Dashboard shows "1" under Devices card
- Dashboard shows device in "Active Devices" table with:
  - Device name: "Test Device"
  - Status: "Online" (green badge)
  - Last Seen: Recent timestamp
- Devices page shows the registered device

**Status:** ☐ Pass / ☐ Fail

---

### Test 11: Submit Watch History ✅

**What to do:**
```bash
curl -X POST http://localhost:3000/api/v1/watch-history \
  -H "Content-Type: application/json" \
  -H "x-api-key: <your-api-key>" \
  -d '{
    "videos": [
      {
        "video_id": "dQw4w9WgXcQ",
        "title": "Test Video",
        "channel_name": "Test Channel",
        "channel_id": "UC12345",
        "thumbnail_url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg",
        "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "watched_at": 1234567890000,
        "duration": 180
      }
    ]
  }'
```

**Expected result:**
```json
{
  "success": true,
  "count": 1,
  "message": "Watch history saved"
}
```

Then check the app:
- Go to Watch History page
- Should see the video with thumbnail, title, and channel

**Status:** ☐ Pass / ☐ Fail

---

### Test 12: Auto-Start on Windows ✅

**What to do:**
1. Close the app completely (right-click tray icon → Quit)
2. Restart your computer
3. After login, wait a few seconds

**Expected result:**
- YouTube Monitor starts automatically
- Icon appears in system tray

**To verify manually:**
1. Press `Win + R`
2. Type: `shell:startup`
3. Check if YouTube Monitor shortcut is there

**Status:** ☐ Pass / ☐ Fail

---

## Troubleshooting

### App won't start
- Make sure you ran `npm install` first
- Check if Node.js is installed: `node --version` (need v16+)
- Delete `node_modules` and run `npm install` again

### Database errors
- Delete the database file: `%APPDATA%/youtube-monitor/youtube-monitor.db`
- Restart the app (it will recreate the database)

### API not responding
- Check if port 3000 is already in use
- Try closing other apps that might use port 3000
- Check Windows Firewall settings

### System tray icon not showing
- Check if system tray icons are hidden
- Look for the arrow icon in the taskbar to show hidden icons

---

## Testing Summary

Once you've completed all tests, count your results:

- **Tests Passed:** ___ / 12
- **Tests Failed:** ___ / 12

### Report Issues

If any tests fail, please report:
1. Which test failed
2. What happened instead
3. Any error messages you saw
4. Screenshots if helpful

---

## Next Steps

Once Phase 1 is working:
- ✅ Move to Phase 2: Extension Integration
- ✅ Chrome extension will connect to this API
- ✅ Real watch history tracking begins

---

## Quick Commands Reference

```bash
# Start the app
npm start

# Run in dev mode
npm run dev

# Build installer (later)
npm run build

# Check database location
echo %APPDATA%\youtube-monitor
```

---

**Phase 1 Status:** Ready for Testing  
**Last Updated:** December 3, 2025  
**Branch:** `phase-1-core-desktop-app`
