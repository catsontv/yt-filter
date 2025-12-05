// API Configuration
const CONFIG = {
  API_URL: 'http://localhost:3000',
  API_VERSION: 'v1',
  SYNC_INTERVAL: 10 * 60 * 1000, // 10 minutes
  HEARTBEAT_INTERVAL: 60 * 1000, // 60 seconds
  MAX_HISTORY_BUFFER: 100, // Max videos to buffer before forcing sync
};

// Helper to get full API endpoint
function getApiEndpoint(path) {
  return `${CONFIG.API_URL}/api/${CONFIG.API_VERSION}${path}`;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, getApiEndpoint };
}
