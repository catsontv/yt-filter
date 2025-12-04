# Phase 2 Testing Guide - Extension Integration

> **Complete checklist to verify Phase 2 features work correctly**

## Prerequisites

✅ Phase 1 desktop app is running  
✅ Desktop app accessible at http://localhost:3000  
✅ Chrome browser installed  
✅ You're ready to test!  

---

## Quick Start (3 Steps)

### Step 1: Install Extension

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Navigate to `yt-filter/extension/` folder
6. Click **Select Folder**

**Expected Result**: ✅ Extension appears in list, no errors

---

### Step 2: Visit YouTube

1. Open new tab
2. Go to https://www.youtube.com
3. Wait 5 seconds
4. Click extension icon in toolbar

**Expected Result**: ✅ Popup shows "Connected to Desktop App"

---

### Step 3: Watch a Video

1. Click any YouTube video
2. Wait for video to load
3. Go to desktop app
4. Click **Watch History** page
5. Wait 10-15 seconds (or click "Sync Now" in extension popup)

**Expected Result**: ✅ Video appears with thumbnail, title, channel name

---

## Detailed Test Suite

### Test 1: Extension Installation ✅

**Steps**:
1. Load extension in Chrome (unpacked)
2. Check `chrome://extensions/` for errors
3. Click extension icon

**Pass Criteria**:
- ✅ Extension loads without errors
- ✅ Icon appears in toolbar
- ✅ Popup opens and shows device info
- ✅ Device ID is a valid UUID format
- ✅ Device Name shows browser and OS (e.g., "Chrome on Windows")

**Debug**:
- If errors, check browser console (F12)
- Verify all extension files are present
- Make sure manifest.json is valid

---

### Test 2: Auto-Registration ✅

**Steps**:
1. Clear extension data: `chrome://extensions/` → Remove → Reload
2. Open desktop app
3. Go to **Dashboard** page
4. Note device count (should be 0 or previous devices)
5. Visit https://www.youtube.com in Chrome
6. Wait 10 seconds
7. Refresh desktop app dashboard

**Pass Criteria**:
- ✅ New device appears in dashboard
- ✅ Device name matches extension popup
- ✅ Status shows "Online" (green dot)
- ✅ "Last Seen" is within last minute

**Debug**:
- Check extension service worker console:
  - `chrome://extensions/` → YouTube Monitor → "service worker"
- Look for "Device registered successfully" message
- Verify desktop app is running on port 3000

---

### Test 3: Watch History Tracking ✅

**Steps**:
1. Go to YouTube
2. Search for any video (e.g., "cute cats")
3. Click on a video
4. Wait for video page to load (2-3 seconds)
5. Open extension popup
6. Check "Buffered Videos" count

**Pass Criteria**:
- ✅ Buffered Videos increases by 1
- ✅ Service worker console shows "Video detected: [title]"
- ✅ No JavaScript errors in console

**Debug**:
- Open content script console (F12 on YouTube page)
- Look for "Video data extracted" log
- Check if video title appears correctly

---

### Test 4: Watch History Sync ✅

**Steps**:
1. Watch 3 different YouTube videos
2. Check extension popup (should show "Buffered Videos: 3")
3. Click **Sync Now** button in popup
4. Go to desktop app
5. Navigate to **Watch History** page

**Pass Criteria**:
- ✅ All 3 videos appear in watch history table
- ✅ Each video shows:
  - ✅ Thumbnail image (not broken)
  - ✅ Correct video title
  - ✅ Correct channel name
  - ✅ Clickable video URL
  - ✅ Recent timestamp (within last few minutes)
- ✅ Extension popup shows "Buffered Videos: 0" after sync

**Debug**:
- Check desktop app API logs (console)
- Verify POST /api/v1/watch-history requests
- Check SQLite database: `SELECT * FROM watch_history;`

---

### Test 5: Automatic Sync (10 Minutes) ✅

**Steps**:
1. Watch a YouTube video
2. **Do NOT click Sync Now**
3. Wait 10 minutes (go make coffee ☕)
4. Check desktop app Watch History page

**Pass Criteria**:
- ✅ Video appears automatically after 10 minutes
- ✅ No manual sync needed

**Debug**:
- Check service worker alarms: `chrome.alarms.getAll()` in console
- Verify alarm is set for 10-minute interval

---

### Test 6: Thumbnails Display ✅

**Steps**:
1. Watch 5 different YouTube videos (mix of channels)
2. Sync to desktop app
3. Go to Watch History page
4. Inspect thumbnail images

**Pass Criteria**:
- ✅ All thumbnails load correctly (not broken image icon)
- ✅ Thumbnails match actual video thumbnails
- ✅ Images are clear (not blurry)
- ✅ Clicking thumbnail doesn't break page

**Debug**:
- Right-click thumbnail → "Open image in new tab"
- Verify URL format: `https://i.ytimg.com/vi/{VIDEO_ID}/mqdefault.jpg`
- Check network tab for failed image requests

---

### Test 7: Device Online Status ✅

**Steps**:
1. Extension installed and running
2. Go to desktop app **Dashboard**
3. Check device status

**Pass Criteria**:
- ✅ Device shows as "Online" (green indicator)
- ✅ "Last Seen" updates every 60 seconds
- ✅ Status is real-time (not cached)

**Debug**:
- Check heartbeat in service worker console
- Look for "Heartbeat sent successfully" every 60 seconds
- Verify GET /api/v1/heartbeat/{device_id} requests

---

### Test 8: Device Offline Detection ✅

**Steps**:
1. Device showing as "Online"
2. Go to `chrome://extensions/`
3. **Disable** YouTube Monitor extension (toggle off)
4. Wait 2 minutes
5. Refresh desktop app dashboard

**Pass Criteria**:
- ✅ Device status changes to "Offline" (red/gray indicator)
- ✅ "Last Seen" shows "2 minutes ago" (or similar)
- ✅ Status updates automatically (if auto-refresh enabled)

**Re-enable**:
- Turn extension back on
- Status should return to "Online" within 60 seconds

**Debug**:
- Check desktop app's device heartbeat logic
- Verify `last_heartbeat` timestamp in database
- Ensure desktop app considers device offline after 2+ minutes

---

### Test 9: Multiple Videos Tracking ✅

**Steps**:
1. Open YouTube
2. Watch 10 different videos in sequence
3. Sync to desktop app
4. Check Watch History page

**Pass Criteria**:
- ✅ All 10 videos appear in history
- ✅ Videos listed in correct chronological order (newest first)
- ✅ No duplicate entries
- ✅ Each video has complete data (title, channel, thumbnail)

**Debug**:
- Check for duplicate video IDs in database
- Verify watch history sorting in UI
- Look for missing data fields

---

### Test 10: Buffer Overflow (100 Videos) ✅

**Steps**:
1. Clear extension data
2. Disable automatic sync temporarily (comment out alarm in background.js)
3. Watch 105 YouTube videos rapidly (or script it)
4. Check if force sync happens at 100

**Pass Criteria**:
- ✅ At 100 videos, automatic sync triggers
- ✅ Buffer clears after sync
- ✅ Videos 101-105 remain in buffer
- ✅ No data loss

**Note**: This is an edge case test. Skip if short on time.

---

### Test 11: Desktop App Data Persistence ✅

**Steps**:
1. Watch 5 videos and sync
2. Close desktop app completely
3. Restart desktop app
4. Go to Watch History page

**Pass Criteria**:
- ✅ All 5 videos still appear
- ✅ Data persisted in SQLite database
- ✅ No data loss on restart

**Debug**:
- Check SQLite database file location
- Verify database file exists and isn't corrupted
- Run: `SELECT COUNT(*) FROM watch_history;`

---

### Test 12: Clickable Video URLs ✅

**Steps**:
1. Watch a video and sync
2. Go to Watch History in desktop app
3. Click on video title or URL

**Pass Criteria**:
- ✅ Clicking video title opens video in browser
- ✅ Opens correct video (not 404)
- ✅ URL format is valid YouTube link

**Debug**:
- Inspect HTML link element
- Verify href attribute is correct
- Check for URL encoding issues

---

### Test 13: Channel Information ✅

**Steps**:
1. Watch videos from 3 different channels
2. Sync to desktop app
3. Check Watch History page

**Pass Criteria**:
- ✅ Each video shows correct channel name
- ✅ Channel names are not "Unknown Channel"
- ✅ Channel names match YouTube

**Debug**:
- Check content script extraction logic
- Verify DOM selector for channel name
- Test with different YouTube page layouts

---

### Test 14: Devices Page Display ✅

**Steps**:
1. Have at least 1 registered device
2. Go to **Devices** page in desktop app

**Pass Criteria**:
- ✅ Device appears in list
- ✅ Shows device name
- ✅ Shows last seen timestamp
- ✅ Shows online/offline status
- ✅ Shows device ID (or truncated version)

**Debug**:
- Check if Devices page is implemented
- Verify data is fetched from database
- Look for console errors in desktop app

---

### Test 15: Dashboard Statistics ✅

**Steps**:
1. Register 1 device
2. Watch 5 videos
3. Sync to desktop app
4. Go to **Dashboard** page

**Pass Criteria**:
- ✅ Dashboard shows device count (1)
- ✅ Dashboard shows total videos watched (5)
- ✅ Dashboard shows recent activity
- ✅ No "No devices yet" message

**Debug**:
- Check dashboard data fetching
- Verify API endpoints return correct counts
- Look for state management issues in React

---

## Performance Tests

### Test P1: Extension CPU Usage

**Steps**:
1. Open Chrome Task Manager (Shift+Esc)
2. Find "Extension: YouTube Monitor"
3. Watch CPU and memory usage while browsing YouTube

**Pass Criteria**:
- ✅ CPU usage < 5% when idle
- ✅ Memory usage < 50MB
- ✅ No memory leaks over time

---

### Test P2: Desktop App Responsiveness

**Steps**:
1. Sync 50+ videos to desktop app
2. Navigate between pages
3. Check UI responsiveness

**Pass Criteria**:
- ✅ Pages load in < 1 second
- ✅ No UI freezing
- ✅ Smooth scrolling in Watch History

---

## Edge Cases

### Test E1: YouTube SPA Navigation

**Steps**:
1. Open YouTube homepage
2. Click on a video (don't open in new tab)
3. Click back button
4. Click another video
5. Repeat 5 times

**Pass Criteria**:
- ✅ All videos detected correctly
- ✅ No duplicate entries
- ✅ No missed videos

---

### Test E2: Network Interruption

**Steps**:
1. Disable internet connection
2. Watch 3 YouTube videos (use cached/offline videos if available)
3. Re-enable internet
4. Check if sync happens

**Pass Criteria**:
- ✅ Videos buffered locally
- ✅ Sync happens when connection restored
- ✅ No data loss

**Note**: May be hard to test depending on setup

---

### Test E3: Desktop App Offline

**Steps**:
1. Close desktop app
2. Watch 5 YouTube videos
3. Restart desktop app
4. Wait for sync or click Sync Now

**Pass Criteria**:
- ✅ Extension buffers videos locally
- ✅ Videos sync when desktop app comes back online
- ✅ No data loss

---

## Troubleshooting

### Issue: Extension won't load

**Solutions**:
- Check Chrome version (needs 88+)
- Verify all files present in extension folder
- Check manifest.json syntax
- Look for errors in `chrome://extensions/`

---

### Issue: Device not registering

**Solutions**:
- Ensure desktop app is running
- Check localhost:3000 is accessible
- Verify CORS is enabled in desktop app
- Check service worker console for errors
- Try visiting YouTube explicitly

---

### Issue: Videos not appearing in desktop app

**Solutions**:
- Check buffered count in extension popup
- Try manual sync
- Verify desktop app API is working (test with Postman)
- Check desktop app console logs
- Inspect database: `SELECT * FROM watch_history;`
- Ensure desktop app UI refreshes data

---

### Issue: Thumbnails not loading

**Solutions**:
- Check image URLs in browser network tab
- Verify thumbnail URL format is correct
- Check CSP (Content Security Policy) in desktop app
- Try opening thumbnail URL directly in browser

---

### Issue: Device always shows offline

**Solutions**:
- Check heartbeat in service worker console
- Verify heartbeat API endpoint is working
- Check if extension is actually running
- Look for network errors in console
- Verify device last_heartbeat timestamp in database

---

## Success Criteria Summary

Phase 2 is **complete** when:

✅ Extension installs without errors  
✅ Device auto-registers on first YouTube visit  
✅ Watch history tracks all videos  
✅ Data syncs every 10 minutes automatically  
✅ Manual sync works via popup  
✅ Thumbnails display correctly  
✅ Device shows online/offline status  
✅ Heartbeat updates every 60 seconds  
✅ Multiple videos tracked correctly  
✅ Data persists across app restarts  
✅ Dashboard shows real device data  
✅ Watch History shows real video data  
✅ Devices page lists all devices with status  

---

## Next Steps

Once all tests pass:

1. ✅ Phase 2 Complete!
2. ➡️ Ready for Phase 3: Basic Blocking
3. See [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) for Phase 3 requirements

---

**Testing Time Estimate**: 30-45 minutes  
**Last Updated**: December 4, 2025  
**Phase**: 2 - Extension Integration
