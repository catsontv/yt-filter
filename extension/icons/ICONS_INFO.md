# Extension Icons

## Required Icons

The extension needs three icon sizes:

- **16x16** - `icon16.png` - Toolbar icon (small)
- **48x48** - `icon48.png` - Extension management page
- **128x128** - `icon128.png` - Chrome Web Store

## Quick Icon Generation

You can create simple placeholder icons or use a proper icon:

### Option 1: Use Online Icon Generator
1. Go to https://www.favicon-generator.org/
2. Upload any image or create simple design
3. Download all sizes
4. Place in this `icons/` folder

### Option 2: Use Emoji as Icon (Quick & Easy)
1. Go to https://favicon.io/emoji-favicons/television/
2. Download the favicon package
3. Rename files to `icon16.png`, `icon48.png`, `icon128.png`
4. Place in this folder

### Option 3: Create with Code (Node.js)

If you have Node.js installed:

```bash
npm install sharp
```

Then create `generate-icons.js`:

```javascript
const sharp = require('sharp');

const svg = `
<svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" fill="#1976d2"/>
  <text x="64" y="80" font-size="64" text-anchor="middle" fill="white">YT</text>
</svg>
`;

sharp(Buffer.from(svg))
  .resize(128, 128)
  .toFile('icon128.png');

sharp(Buffer.from(svg))
  .resize(48, 48)
  .toFile('icon48.png');

sharp(Buffer.from(svg))
  .resize(16, 16)
  .toFile('icon16.png');
```

Run: `node generate-icons.js`

## Temporary Solution

For testing, you can use any PNG images of the right sizes. The extension will work without custom icons (Chrome will use default icon).

## Current Status

⚠️ **Icons not included in repo** - Please generate your own using one of the methods above.

The extension will still load and work, but won't have a custom icon until you add these files.
