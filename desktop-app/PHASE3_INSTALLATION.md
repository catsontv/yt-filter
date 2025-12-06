# Phase 3 Installation Guide

> **Quick setup guide for Phase 3: Basic Blocking**

## 📦 Prerequisites

- Node.js 16+ installed
- Git installed
- Chrome browser
- Windows OS (for full testing)

---

## 🚀 Installation Steps

### Step 1: Clone and Switch Branch

```bash
# Clone repository (if not already done)
git clone https://github.com/catsontv/yt-filter.git
cd yt-filter

# Switch to Phase 3 branch
git checkout phase-3-basic-blocking

# Pull latest changes
git pull origin phase-3-basic-blocking
```

### Step 2: Install Desktop App

```bash
cd desktop-app
npm install
```

This will install all dependencies including:
- express
- sqlite3
- electron
- react
- And all other required packages

### Step 3: Start Desktop App

```bash
npm start
```

**Expected output:**
```
[Database] Initializing database...
[Database] Database initialized successfully
[API] Server running on http://localhost:3000
[Electron] App started
```

The desktop app window should open automatically.

### Step 4: Install Chrome Extension

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right)
4. Click **"Load unpacked"**
5. Navigate to `yt-filter/extension/` folder
6. Click **"Select Folder"**

**Extension should appear:**
- Name: "YouTube Monitor"
- Version: 0.3.0
- Icon in toolbar

### Step 5: Test Extension

1. Click extension icon
2. Should show "Connected to Desktop App"
3. Visit https://www.youtube.com
4. Extension should auto-register device
5. Check desktop app Dashboard - device should appear

---

## ✅ Verification

### Desktop App Checklist

- [ ] App launches without errors
- [ ] Dashboard page loads
- [ ] Blocks page loads
- [ ] No console errors
- [ ] Database file created (check userData folder)
- [ ] API responds at http://localhost:3000

### Extension Checklist

- [ ] Extension loads without errors
- [ ] Icon appears in toolbar
- [ ] Popup shows connection status
- [ ] Device registers automatically
- [ ] No errors in console (F12 → Console)
- [ ] No errors in extension (chrome://extensions/ → Errors)

---

## 🔍 Troubleshooting

### Desktop App Won't Start

**Error: "Cannot find module 'express'"**
```bash
cd desktop-app
rm -rf node_modules
rm package-lock.json
npm install
```

**Error: "Database initialization failed"**
- Check write permissions in userData folder
- Try running as administrator
- Check antivirus isn't blocking

**Error: "Port 3000 already in use"**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in src/api/server.js
```

### Extension Won't Load

**Error: "Manifest version 3 is required"**
- Update Chrome to latest version (v88+)
- Ensure manifest.json has `"manifest_version": 3`

**Error: "Failed to load extension"**
- Check all files exist in extension folder
- Verify manifest.json is valid JSON
- Check for syntax errors in JS files

**Extension loads but doesn't connect**
- Ensure desktop app is running
- Check http://localhost:3000 is accessible
- Verify no firewall blocking
- Check extension console for errors

### Extension Console Errors

**How to check:**
1. Visit YouTube
2. Press F12 (Dev Tools)
3. Go to Console tab
4. Look for red errors

**Common errors:**
- `Fetch failed` - Desktop app not running
- `CORS error` - Check API CORS settings
- `undefined is not a function` - Check blocker.js loaded

---

## 📱 Testing Phase 3 Features

### Quick Test (2 minutes)

1. **Add a block:**
   - Go to Blocks page in desktop app
   - Click "+ Add Block"
   - Paste: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - Click "Add Block"
   - Should appear in table ✅

2. **Test block works:**
   - Open same video in Chrome
   - Should show overlay ✅
   - Video player should be hidden ✅

3. **Check attempt counter:**
   - Go to Dashboard
   - "Block Attempts Today" should be 1 ✅

**All working? Phase 3 is ready! 🎉**

---

## 📚 Documentation

- **Full Testing Guide:** [PHASE3_TESTING_GUIDE.md](../PHASE3_TESTING_GUIDE.md)
- **Feature Overview:** [PHASE3_README.md](../PHASE3_README.md)
- **Development Plan:** [DEVELOPMENT_PLAN.md](../DEVELOPMENT_PLAN.md)

---

## 📧 Support

If you encounter issues:

1. Check troubleshooting section above
2. Review console logs (both desktop app and extension)
3. Verify all files are present
4. Check GitHub Issues for similar problems
5. Create new issue with:
   - Error messages
   - Console logs
   - Steps to reproduce
   - OS/Browser versions

---

## 🎯 Next Steps

Once Phase 3 is working:

1. Complete full test suite (PHASE3_TESTING_GUIDE.md)
2. Take screenshots of working features
3. Document any bugs found
4. Prepare for Phase 4: Advanced Blocking

---

**Installation complete! Happy testing! 🚀**
