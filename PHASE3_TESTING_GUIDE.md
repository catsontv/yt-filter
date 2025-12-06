# Phase 3 Testing Guide - Basic Blocking

> **Phase 3 Goal:** Block videos and channels, show block overlay, track block attempts

## 📦 What's New in Phase 3?

### Features Added
1. **Block Management UI**
   - Add blocks by pasting YouTube URLs
   - Auto-detect video vs channel
   - Optional custom messages
   - Per-device or global blocks
   - Delete blocks

2. **Block Enforcement (Extension)**
   - Fetches block list from desktop app
   - Checks current video/channel against blocks
   - Shows beautiful overlay when blocked
   - Prevents video playback

3. **Block Attempt Tracking**
   - Logs every attempt to access blocked content
   - Shows stats in dashboard
   - Stores device, video, timestamp

---

## ✅ Complete Test Suite

### Test 1: Add Video Block
**Goal:** Block a specific video

**Steps:**
1. Start desktop app (`npm start` in desktop-app folder)
2. Navigate to **Blocks** page
3. Click **"+ Add Block"** button
4. Paste a YouTube video URL (e.g., `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)
5. Leave "Apply To" as "All Devices"
6. Leave custom message blank
7. Click **"Add Block"**

**Expected:**
- ✅ Block appears in the table
- ✅ Shows video thumbnail
- ✅ Shows "All Devices"
- ✅ Green success message appears
- ✅ Date added is current time

**Pass/Fail:** ___________

---

### Test 2: Block Works in Extension
**Goal:** Verify blocked video shows overlay

**Steps:**
1. Ensure extension is loaded in Chrome
2. Open Chrome, go to YouTube
3. Try to watch the blocked video from Test 1

**Expected:**
- ✅ Video page loads but shows overlay instead of player
- ✅ Overlay displays: "⚠️ Content Restricted"
- ✅ Message says "This video has been blocked"
- ✅ Video player is hidden
- ✅ "Return to YouTube Home" button works

**Pass/Fail:** ___________

---

### Test 3: Custom Message Appears
**Goal:** Custom block message displays correctly

**Steps:**
1. Add another video block
2. In custom message field, type: "This video contains inappropriate language"
3. Click "Add Block"
4. Try to watch this video in extension

**Expected:**
- ✅ Overlay shows custom message
- ✅ Message appears under "Reason:"
- ✅ Message is highlighted/formatted differently

**Pass/Fail:** ___________

---

### Test 4: Channel Block
**Goal:** Block entire channel

**Steps:**
1. Find a YouTube channel URL (e.g., `https://www.youtube.com/@MrBeast`)
2. Add block using channel URL
3. Try to watch ANY video from that channel

**Expected:**
- ✅ Block appears with channel badge (📺)
- ✅ Overlay says "This channel has been blocked"
- ✅ ALL videos from that channel are blocked
- ✅ Block overlay shows channel name

**Pass/Fail:** ___________

---

### Test 5: Block Attempts Logged
**Goal:** Verify attempts are tracked

**Steps:**
1. Go to Dashboard in desktop app
2. Note the "Block Attempts Today" count
3. Try to access a blocked video 3 times (refresh page)
4. Return to Dashboard

**Expected:**
- ✅ Counter increases by 3
- ✅ Counter updates automatically (within 10 seconds)
- ✅ Each attempt is logged separately

**Pass/Fail:** ___________

---

### Test 6: Unblock Works
**Goal:** Removing block restores access

**Steps:**
1. Delete a block using the 🗑️ button
2. Confirm deletion
3. Try to watch the previously blocked video

**Expected:**
- ✅ Block disappears from table
- ✅ Video becomes accessible again
- ✅ No overlay appears
- ✅ Video plays normally

**Pass/Fail:** ___________

---

### Test 7: Multiple Devices
**Goal:** Global blocks affect all devices

**Steps:**
1. Add a block with "Apply To: All Devices"
2. Open extension on a different browser profile or computer
3. Try to access blocked content

**Expected:**
- ✅ Block works on all registered devices
- ✅ Overlay appears on all devices
- ✅ Block list syncs automatically

**Pass/Fail:** ___________

---

### Test 8: Per-Device Block
**Goal:** Device-specific blocks only affect one device

**Steps:**
1. Have 2 devices registered
2. Add block, select specific device from dropdown
3. Test on both devices

**Expected:**
- ✅ Block works on selected device only
- ✅ Other devices can still access content
- ✅ Block table shows device name

**Pass/Fail:** ___________

---

### Test 9: URL Format Validation
**Goal:** Only accept valid YouTube URLs

**Steps:**
1. Try adding block with invalid URL: `https://google.com`
2. Try adding with `https://youtu.be/VIDEO_ID` (short URL)
3. Try adding with `https://www.youtube.com/channel/UC...`

**Expected:**
- ✅ Invalid URL shows error message
- ✅ Short URLs (youtu.be) work correctly
- ✅ Channel URLs work correctly
- ✅ Error message is clear

**Pass/Fail:** ___________

---

### Test 10: Overlay Appearance
**Goal:** Overlay looks professional

**Steps:**
1. Trigger a blocked video
2. Check overlay visual design

**Expected:**
- ✅ Overlay covers entire page
- ✅ Text is readable and centered
- ✅ Button has hover effect
- ✅ Design matches screenshot below
- ✅ No console errors

**Pass/Fail:** ___________

---

## 🚀 Quick Test (5 Minutes)

**Rapid verification for Phase 3:**

1. ✅ Desktop app Blocks page loads
2. ✅ Add video block - appears in table
3. ✅ Watch blocked video - overlay appears
4. ✅ Custom message shows in overlay
5. ✅ Block attempts counter increases
6. ✅ Delete block - video accessible again
7. ✅ Add channel block - all videos blocked

**All passed? Phase 3 is working! 🎉**

---

## 🔧 Troubleshooting

### "Block doesn't appear in extension"
**Solutions:**
- Wait 30 seconds (blocks sync every 30s)
- Check browser console for errors
- Verify desktop app is running
- Try manually refreshing extension
- Check `chrome://extensions/` for errors

### "Overlay doesn't show"
**Solutions:**
- Ensure `blocker.js` is loaded (check manifest.json)
- Check if content script is running (console log)
- Verify video URL matches block format
- Try hard refresh (Ctrl+Shift+R)
- Check for JavaScript errors in console

### "Can't add block"
**Solutions:**
- Verify URL is valid YouTube link
- Check desktop app API is running (localhost:3000)
- Look for error message in UI
- Check browser network tab for failed requests
- Verify database has blocks table

### "Block attempts not counting"
**Solutions:**
- Check API endpoint `/api/v1/blocks/attempts` exists
- Verify device_id is being sent
- Check database has block_attempts table
- Look for errors in desktop app console
- Ensure dashboard auto-refresh is working

---

## 📊 Expected Performance

- **Block Detection:** Instant (on page load)
- **Overlay Display:** < 100ms
- **Block Sync:** Every 30 seconds
- **UI Responsiveness:** Smooth, no lag
- **Database Query:** < 10ms per operation

---

## 📁 Files Changed/Added

### Desktop App
- `src/api/blocks.js` - New API endpoints
- `src/database/blocks.js` - Database operations
- `src/database/init.js` - Added block_attempts table
- `src/renderer/pages/Blocks.jsx` - Complete rewrite
- `src/renderer/styles/Blocks.css` - New styles

### Extension
- `blocker.js` - New content blocker
- `manifest.json` - Updated to v0.3.0
- `content.js` - Enhanced for blocking

---

## ✅ Phase 3 Completion Checklist

Before moving to Phase 4:

- [ ] All 10 tests pass
- [ ] Blocks appear correctly in UI
- [ ] Overlay displays properly
- [ ] Custom messages work
- [ ] Channel blocking works
- [ ] Block attempts tracked
- [ ] No console errors
- [ ] Desktop app stable
- [ ] Extension doesn't crash
- [ ] Database operations fast

---

## 📝 Test Results Summary

**Tester:** _______________  
**Date:** _______________  
**Browser:** Chrome _______  
**OS:** Windows _______

| Test # | Test Name | Result | Notes |
|--------|-----------|--------|-------|
| 1 | Add Video Block | ☐ Pass ☐ Fail | |
| 2 | Block Works | ☐ Pass ☐ Fail | |
| 3 | Custom Message | ☐ Pass ☐ Fail | |
| 4 | Channel Block | ☐ Pass ☐ Fail | |
| 5 | Attempts Logged | ☐ Pass ☐ Fail | |
| 6 | Unblock Works | ☐ Pass ☐ Fail | |
| 7 | Multiple Devices | ☐ Pass ☐ Fail | |
| 8 | Per-Device Block | ☐ Pass ☐ Fail | |
| 9 | URL Validation | ☐ Pass ☐ Fail | |
| 10 | Overlay Design | ☐ Pass ☐ Fail | |

**Overall Result:** ☐ PASS ☐ FAIL

---

## 🎯 Next Steps

If all tests pass:
1. Document any bugs found
2. Take screenshots of working features
3. Prepare for **Phase 4: Advanced Blocking**
   - Keyword filtering
   - Time-based rules
   - Daily time limits

---

*Phase 3 Complete! Ready for Phase 4? 🚀*
