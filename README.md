# YouTube Filter & Monitor System

A comprehensive YouTube monitoring and control system consisting of:
- **Chrome Extension**: Monitors YouTube activity, enforces content restrictions, and disables video seeking
- **WordPress Plugin**: Admin panel for viewing watch history, managing blocks, and monitoring multiple devices

## 🎯 Project Goals

This is a personal project designed to monitor YouTube usage across multiple devices and provide parental controls including:
- Track watch history across devices
- Block specific videos or entire channels
- Disable video seeking (timeline/progress bar)
- Remote administration via WordPress dashboard
- Multi-device support with individual or global restrictions

## 📁 Repository Structure

```
yt-filter/
├── extension/              # Chrome Extension (to be reorganized)
│   ├── manifest.json
│   ├── content.js
│   ├── background.js
│   └── config.json (future)
│
├── wordpress-plugin/       # WordPress Admin Backend
│   ├── yt-monitor.php     # Main plugin file
│   ├── includes/          # PHP classes
│   │   ├── class-database.php
│   │   ├── class-api.php
│   │   ├── class-notifications.php
│   │   └── class-device-manager.php
│   ├── admin/             # Admin UI pages
│   │   ├── dashboard.php
│   │   ├── watch-history.php
│   │   ├── blocks.php
│   │   ├── devices.php
│   │   └── settings.php
│   └── assets/            # CSS/JS
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- WordPress installation with admin access
- Domain with SSL (e.g., https://yt.ai15.me)
- Chrome browser

### Installation

#### 1. WordPress Plugin Setup

```bash
# Clone repository
git clone https://github.com/catsontv/yt-filter.git

# Copy plugin to WordPress
cp -r yt-filter/wordpress-plugin /path/to/wordpress/wp-content/plugins/yt-monitor

# Activate plugin in WordPress admin
# Navigate to: Plugins → YouTube Monitor → Activate
```

#### 2. Configure WordPress Plugin

1. Go to **YT Monitor → Settings**
2. Set **Admin / API URL** to your WordPress URL (e.g., `https://yt.ai15.me`)
3. Configure **Data Retention** (default: 30 days)
4. (Optional) Enable **Notifications** and configure alert preferences
5. Click **Save Settings**

#### 3. Chrome Extension Setup

1. Download the extension folder from this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked**
5. Select the `extension` folder
6. Extension will auto-register with WordPress on first YouTube visit

## 🎨 Features

### Chrome Extension

✅ **Current Features:**
- Disable video seeking (timeline/progress bar)
- Prevent keyboard shortcuts for seeking (arrow keys, J/L, number keys)
- Block repeat views (3 times limit - proof of concept)
- Store watch history locally

🔄 **Planned Features (Phase 2):**
- Sync watch history to WordPress
- Download and enforce block lists from WordPress
- Heartbeat monitoring
- Device registration and authentication
- Offline queue for watch history

### WordPress Plugin

✅ **Current Features (Phase 1 - MVP):**
- REST API endpoints for device communication
- Database schema for devices, watch history, blocks
- Settings page with configurable API URL and data retention
- Notification system (with master enable/disable)
- Basic dashboard showing device status
- Automatic data cleanup (30-day retention)

🔄 **Planned Features:**
- Full admin UI for watch history viewing (Phase 3)
- Block management interface (Phase 3)
- Device management tools (Phase 3)
- Analytics and reporting (Phase 4)
- Auto-block rules (Phase 4)

## 📡 REST API Endpoints

Base URL: `https://yt.ai15.me/wp-json/yt-filter/v1/`

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/register` | POST | Register new device | None |
| `/watch-history` | POST | Upload watch history batch | API Key |
| `/blocks/{device_id}` | GET | Get block list for device | API Key |
| `/heartbeat/{device_id}` | GET | Heartbeat ping | API Key |
| `/block-attempt` | POST | Log blocked content attempt | API Key |

**Authentication:** Include `X-YT-Device-Key` header with device API key.

## 🗓️ Development Roadmap

### Phase 1: Core Infrastructure (✅ COMPLETE)
**Goal:** MVP backend with database and REST API

- [x] WordPress plugin skeleton
- [x] Database tables (devices, watch_history, blocks, block_attempts)
- [x] REST API endpoints (register, watch-history, blocks, heartbeat, block-attempt)
- [x] Settings page (API URL, data retention, notifications)
- [x] Notification system with master toggle
- [x] Automatic data cleanup cron job
- [x] Basic dashboard UI

### Phase 2: Extension Integration (🔄 NEXT)
**Goal:** Connect extension to WordPress API

- [ ] Reorganize extension into `/extension` folder
- [ ] Add `config.json` for API URL configuration
- [ ] Implement device registration on first run
- [ ] Sync watch history to WordPress (every 10 minutes)
- [ ] Fetch and enforce block lists from WordPress
- [ ] Local caching of block list
- [ ] Offline queue for pending watch history
- [ ] Update README with extension configuration steps

### Phase 3: Admin UI Polish
**Goal:** Complete admin interface

- [ ] Watch History page
  - Filterable table (device, date, channel)
  - Search functionality
  - Quick block buttons
  - CSV export
- [ ] Blocks Management page
  - List all blocks
  - Add blocks by URL or ID
  - Per-device vs global blocks
  - Bulk import/export
- [ ] Devices Management page
  - Device list with online/offline status
  - Rename devices
  - Activate/deactivate devices
  - Per-device statistics
  - Delete device
- [ ] Improve dashboard with charts and stats

### Phase 4: Reliability & Protection
**Goal:** Tamper detection and monitoring

- [ ] Extension heartbeat system (ping every 60 seconds)
- [ ] WordPress tracks `last_heartbeat` per device
- [ ] Device offline detection and alerts
- [ ] Tamper awareness (extension disabled detection)
- [ ] Debug mode toggle in settings
- [ ] Better error handling and logging

### Phase 5: Quality & Documentation
**Goal:** Production-ready polish

- [ ] UI/UX improvements
- [ ] Code cleanup and documentation
- [ ] Setup guide with screenshots
- [ ] Video tutorial
- [ ] Testing across different environments
- [ ] Performance optimization

## ⚙️ Configuration

### Data Retention

Watch history is automatically deleted after the configured retention period (default: 30 days). This is handled by a daily WordPress cron job.

**To change retention:**
1. Go to **YT Monitor → Settings**
2. Set **Data Retention** to desired number of days
3. Click **Save Settings**

### Notifications

Notifications can be completely disabled via the master toggle in Settings.

**Available notification types:**
- Device offline (30+ minutes)
- Multiple block attempts (5+ in 1 hour)
- Daily activity digest
- Weekly summary report

**To configure:**
1. Go to **YT Monitor → Settings**
2. Check **Enable Notifications**
3. Enter **Notification Email**
4. Select which **Alert Types** to receive
5. Click **Save Settings**

### Multi-Device Support

Each device gets a unique `device_id` and `api_key` upon registration. Blocks can be applied:
- **Globally**: Affect all devices
- **Per-device**: Affect only specific devices

## 🔒 Privacy & Security

- All data stored in your self-hosted WordPress database
- API authentication via unique device keys
- HTTPS required for external communication
- No data sent to third parties
- Automatic data cleanup after retention period

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome via issues.

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

## 🔗 Links

- Repository: https://github.com/catsontv/yt-filter
- Issues: https://github.com/catsontv/yt-filter/issues

---

**Current Status:** Phase 1 complete, Phase 2 in progress

**Last Updated:** November 29, 2025