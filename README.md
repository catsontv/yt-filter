# YouTube Filter Chrome Extension

A proof-of-concept Chrome extension that adds two key features to YouTube:

## Features

1. **Disable Timelapse/Playback Speed**: Prevents users from changing the playback speed of videos, keeping it locked at 1.0x normal speed.

2. **Video Repeat Limit**: Tracks how many times you watch the same video and blocks access after 3 views, redirecting to the YouTube homepage.

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/catsontv/yt-filter.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" (toggle in the top-right corner)

4. Click "Load unpacked"

5. Select the `yt-filter` folder

6. The extension is now installed and active!

## How It Works

### Disable Timelapse
- Hides the playback speed option from YouTube's settings menu
- Locks the video playback rate to 1.0x
- Prevents keyboard shortcuts from changing speed

### Video Repeat Limit
- Tracks video views using Chrome's storage API
- Stores watch count per video ID
- After 3 views of the same video, displays a warning overlay
- Automatically redirects to YouTube homepage after 3 seconds
- Right-click on any YouTube page and select "Reset Video Watch Count" to clear the history

## File Structure

```
yt-filter/
├── manifest.json      # Extension configuration
├── content.js         # Main functionality script
├── background.js      # Background service worker
└── README.md         # This file
```

## Development

This is a proof-of-concept extension. Future enhancements could include:

- Customizable repeat limits
- Whitelist/blacklist for specific channels
- Statistics dashboard
- Options page for user preferences
- Better icon design

## Privacy

All data is stored locally in your browser. No information is sent to external servers.

## License

MIT License - Feel free to modify and distribute as needed.
