# YouTube Monitor - Chrome Extension

> Phase 2: Extension Integration

## Overview

This Chrome extension tracks YouTube watch history and syncs it to the desktop app running on the parent's computer.

## Features (Phase 2)

✅ **Auto-Registration** - Automatically registers with desktop app on first YouTube visit  
✅ **Watch History Tracking** - Detects and logs every YouTube video watched  
✅ **Automatic Sync** - Syncs watch history every 10 minutes  
✅ **Heartbeat Monitoring** - Pings desktop app every 60 seconds  
✅ **Device Management** - Generates unique device ID and name  
✅ **Manual Sync** - Force sync via popup interface  
✅ **Offline Buffer** - Stores up to 100 videos locally before syncing  

## Installation

### For Testing (Developer Mode)

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `extension` folder from this repository
5. Extension icon should appear in your toolbar

### Verify Installation

1. Click the extension icon
2. You should see your Device ID and Device Name
3. Status should show "Connected to Desktop App" (if desktop app is running)

## How It Works

### First Time Setup

1. **Extension installs** → Generates unique Device ID (UUID)
2. **User visits YouTube** → Extension registers with desktop app
3. **Registration successful** → Desktop app shows device in dashboard
4. **Heartbeat starts** → Extension pings every 60 seconds

### Watch History Tracking

1. **User navigates to video** → Content script detects page
2. **Video data extracted**:
   - Video ID, Title, Channel, Thumbnail, URL
   - Timestamp (when video was accessed)
3. **Stored locally** → Buffered in extension storage
4. **Auto-sync** → Sent to desktop app every 10 minutes
5. **Desktop app** → Displays in Watch History page

### Heartbeat System

- Extension sends heartbeat every 60 seconds
- Desktop app updates `last_heartbeat` timestamp
- If no heartbeat for 2+ minutes → Device shown as "Offline"
- Heartbeat includes device status but no sensitive data

## File Structure

```
extension/
├── manifest.json       # Extension configuration (Manifest V3)
├── config.js          # API URL and settings
├── background.js      # Service worker (registration, sync, heartbeat)
├── content.js         # YouTube page detection and data extraction
├── popup.html         # Extension popup UI
├── popup.js           # Popup logic
├── icons/            # Extension icons (16x16, 48x48, 128x128)
└── README.md         # This file
```

## Configuration

### API URL (config.js)

```javascript
const CONFIG = {
  API_URL: 'http://localhost:3000',  // Desktop app API
  SYNC_INTERVAL: 10 * 60 * 1000,     // 10 minutes
  HEARTBEAT_INTERVAL: 60 * 1000,     // 60 seconds
  MAX_HISTORY_BUFFER: 100,           // Max videos before force sync
};
```

### For Remote Access (Phase 6)

When Cloudflare Tunnel is enabled:
```javascript
API_URL: 'https://your-tunnel-url.trycloudflare.com'
```

## Testing

See [PHASE2_TESTING_GUIDE.md](../PHASE2_TESTING_GUIDE.md) for complete test checklist.

### Quick Tests

1. **Installation**: Load extension, no console errors
2. **Registration**: Visit YouTube, check desktop app dashboard
3. **Watch Tracking**: Watch video, appears in desktop app within 10 min
4. **Heartbeat**: Device shows "Online" in dashboard
5. **Offline Detection**: Disable extension, device goes "Offline"

## Troubleshooting

### Extension won't install
- Make sure you're in Developer Mode
- Check Chrome version (needs Chrome 88+)
- Look for errors in `chrome://extensions/`

### Device not appearing in desktop app
- Ensure desktop app is running
- Check desktop app is listening on port 3000
- Look at browser console for errors (F12)
- Try manually syncing via popup

### Watch history not syncing
- Check extension popup for buffer count
- Try manual sync button
- Verify desktop app API is accessible
- Check background service worker console:
  1. Go to `chrome://extensions/`
  2. Find YouTube Monitor
  3. Click "service worker" link
  4. Check console for errors

### Device shows as "Offline"
- Extension might be disabled
- Desktop app might not be running
- Network issue blocking localhost:3000
- Check heartbeat in service worker console

## Privacy & Data

### What's Tracked
- Video ID, title, channel name
- Video thumbnail URL
- Timestamp when video page was accessed
- Device info (browser, OS)

### What's NOT Tracked
- Watch duration (how long you watched)
- Search queries
- Comments or likes
- Private browsing (incognito)
- Videos in playlists (unless you click on them)

### Data Storage
- Buffered locally until sync
- Sent to desktop app (parent's computer)
- Desktop app stores in SQLite database
- No third-party servers involved

## Permissions Explained

```json
"permissions": [
  "storage",  // Store device ID and watch history buffer
  "tabs",     // Detect YouTube tab navigation
  "alarms"    // Periodic sync and heartbeat timers
]
```

```json
"host_permissions": [
  "*://www.youtube.com/*",   // Access YouTube pages
  "http://localhost:3000/*"   // Communicate with desktop app
]
```

## Known Limitations (Phase 2)

- ❌ No content blocking yet (Phase 3)
- ❌ No keyword filtering (Phase 4)
- ❌ No time restrictions (Phase 4)
- ❌ No password protection (Phase 5)
- ❌ No incognito detection (Phase 5)
- ❌ No remote access support (Phase 6)

## Next Phase

**Phase 3: Basic Blocking**
- Block videos and channels
- Show block overlay
- Track block attempts

See [DEVELOPMENT_PLAN.md](../DEVELOPMENT_PLAN.md) for full roadmap.

## Support

For issues or questions:
- Check [PHASE2_TESTING_GUIDE.md](../PHASE2_TESTING_GUIDE.md)
- Open issue on [GitHub](https://github.com/catsontv/yt-filter/issues)

---

**Status**: ✅ Phase 2 Complete  
**Last Updated**: December 4, 2025
