/**
 * Content Blocker for YouTube
 * Phase 3: Basic Blocking
 * 
 * This script runs on YouTube pages and enforces content blocks
 */

let currentBlocks = [];
let currentVideoId = null;
let currentChannelId = null;

// Fetch blocks from desktop app
async function fetchBlocks() {
  try {
    const deviceId = await getDeviceId();
    const API_URL = await getApiUrl();
    
    const response = await fetch(`${API_URL}/api/v1/blocks/${deviceId}`);
    const data = await response.json();
    
    if (data.success) {
      currentBlocks = data.blocks;
      console.log(`[Blocker] Fetched ${currentBlocks.length} blocks`);
      return currentBlocks;
    }
  } catch (error) {
    console.error('[Blocker] Error fetching blocks:', error);
  }
  return [];
}

// Get device ID from storage
async function getDeviceId() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['deviceId'], (result) => {
      resolve(result.deviceId || null);
    });
  });
}

// Get API URL from storage
async function getApiUrl() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['apiUrl'], (result) => {
      resolve(result.apiUrl || 'http://localhost:3000');
    });
  });
}

// Extract video ID from current page
function extractVideoId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('v');
}

// Extract channel ID from page
function extractChannelId() {
  // Try to get from channel link
  const channelLink = document.querySelector('a.yt-simple-endpoint.style-scope.yt-formatted-string[href^="/@"]');
  if (channelLink) {
    const href = channelLink.getAttribute('href');
    return href.replace('/@', '');
  }
  
  // Try alternate selectors
  const channelOwnerLink = document.querySelector('#owner a[href*="/@"]');
  if (channelOwnerLink) {
    const href = channelOwnerLink.getAttribute('href');
    return href.replace('/@', '');
  }
  
  return null;
}

// Check if current content is blocked
function isContentBlocked() {
  const videoId = extractVideoId();
  const channelId = extractChannelId();
  
  if (!videoId) return null;
  
  // Check if video is blocked
  const videoBlock = currentBlocks.find(block => 
    block.type === 'video' && block.youtube_id === videoId
  );
  if (videoBlock) {
    return { type: 'video', block: videoBlock, id: videoId };
  }
  
  // Check if channel is blocked
  if (channelId) {
    const channelBlock = currentBlocks.find(block => 
      block.type === 'channel' && 
      (block.youtube_id === channelId || block.youtube_id === `@${channelId}`)
    );
    if (channelBlock) {
      return { type: 'channel', block: channelBlock, id: channelId };
    }
  }
  
  return null;
}

// Log block attempt to desktop app
async function logBlockAttempt(blockInfo) {
  try {
    const deviceId = await getDeviceId();
    const API_URL = await getApiUrl();
    
    // Get video metadata
    const videoTitle = document.querySelector('h1.ytd-watch-metadata yt-formatted-string')?.textContent || 'Unknown';
    const channelName = document.querySelector('#owner a')?.textContent?.trim() || 'Unknown';
    
    await fetch(`${API_URL}/api/v1/blocks/attempts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        device_id: deviceId,
        youtube_id: blockInfo.id,
        type: blockInfo.type,
        video_title: videoTitle,
        channel_name: channelName
      })
    });
    
    console.log('[Blocker] Block attempt logged');
  } catch (error) {
    console.error('[Blocker] Error logging block attempt:', error);
  }
}

// Show block overlay
function showBlockOverlay(blockInfo) {
  // Remove existing overlay if any
  removeBlockOverlay();
  
  const overlay = document.createElement('div');
  overlay.id = 'yt-filter-block-overlay';
  overlay.innerHTML = `
    <div class="yt-filter-block-content">
      <div class="yt-filter-block-icon">⚠️</div>
      <h1 class="yt-filter-block-title">Content Restricted</h1>
      <p class="yt-filter-block-message">
        This ${blockInfo.type} has been blocked.
      </p>
      ${blockInfo.block.custom_message ? `
        <div class="yt-filter-custom-message">
          <strong>Reason:</strong> ${blockInfo.block.custom_message}
        </div>
      ` : ''}
      <div class="yt-filter-block-details">
        <p><strong>${blockInfo.type === 'video' ? 'Video' : 'Channel'}:</strong> ${blockInfo.block.title || 'Unknown'}</p>
        ${blockInfo.block.channel_name ? `<p><strong>Channel:</strong> ${blockInfo.block.channel_name}</p>` : ''}
      </div>
      <button class="yt-filter-home-button" onclick="window.location.href='https://www.youtube.com'">
        🏠 Return to YouTube Home
      </button>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Hide YouTube player and content
  const player = document.querySelector('#player');
  const primaryInner = document.querySelector('#primary-inner');
  const secondary = document.querySelector('#secondary');
  
  if (player) player.style.display = 'none';
  if (primaryInner) primaryInner.style.display = 'none';
  if (secondary) secondary.style.display = 'none';
}

// Remove block overlay
function removeBlockOverlay() {
  const overlay = document.getElementById('yt-filter-block-overlay');
  if (overlay) {
    overlay.remove();
  }
  
  // Restore hidden content
  const player = document.querySelector('#player');
  const primaryInner = document.querySelector('#primary-inner');
  const secondary = document.querySelector('#secondary');
  
  if (player) player.style.display = '';
  if (primaryInner) primaryInner.style.display = '';
  if (secondary) secondary.style.display = '';
}

// Check and enforce blocks
async function checkAndEnforce() {
  await fetchBlocks();
  
  const blockInfo = isContentBlocked();
  
  if (blockInfo) {
    console.log('[Blocker] Content is blocked:', blockInfo);
    showBlockOverlay(blockInfo);
    await logBlockAttempt(blockInfo);
  } else {
    removeBlockOverlay();
  }
}

// Initialize blocker
async function initBlocker() {
  console.log('[Blocker] Initializing...');
  
  // Add styles
  injectStyles();
  
  // Check immediately
  await checkAndEnforce();
  
  // Watch for URL changes (YouTube is a SPA)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      console.log('[Blocker] URL changed, rechecking...');
      setTimeout(checkAndEnforce, 500);
    }
  }).observe(document, { subtree: true, childList: true });
  
  // Re-fetch blocks every 30 seconds
  setInterval(async () => {
    await fetchBlocks();
    // Recheck if still on watch page
    if (window.location.pathname === '/watch') {
      const blockInfo = isContentBlocked();
      if (blockInfo && !document.getElementById('yt-filter-block-overlay')) {
        showBlockOverlay(blockInfo);
        await logBlockAttempt(blockInfo);
      }
    }
  }, 30000);
}

// Inject CSS styles
function injectStyles() {
  if (document.getElementById('yt-filter-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'yt-filter-styles';
  style.textContent = `
    #yt-filter-block-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'YouTube Sans', 'Roboto', sans-serif;
    }
    
    .yt-filter-block-content {
      background: white;
      border-radius: 16px;
      padding: 48px;
      max-width: 600px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    .yt-filter-block-icon {
      font-size: 72px;
      margin-bottom: 20px;
    }
    
    .yt-filter-block-title {
      font-size: 32px;
      margin: 0 0 16px 0;
      color: #1a1a1a;
      font-weight: 700;
    }
    
    .yt-filter-block-message {
      font-size: 18px;
      color: #555;
      margin: 0 0 24px 0;
      line-height: 1.6;
    }
    
    .yt-filter-custom-message {
      background: #f3f4f6;
      border-left: 4px solid #ef4444;
      padding: 16px;
      border-radius: 8px;
      margin: 24px 0;
      text-align: left;
      color: #374151;
    }
    
    .yt-filter-custom-message strong {
      color: #1f2937;
    }
    
    .yt-filter-block-details {
      background: #f9fafb;
      border-radius: 8px;
      padding: 20px;
      margin: 24px 0;
      text-align: left;
    }
    
    .yt-filter-block-details p {
      margin: 8px 0;
      color: #4b5563;
      font-size: 14px;
    }
    
    .yt-filter-block-details strong {
      color: #1f2937;
    }
    
    .yt-filter-home-button {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      margin-top: 8px;
    }
    
    .yt-filter-home-button:hover {
      background: #2563eb;
    }
  `;
  
  document.head.appendChild(style);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBlocker);
} else {
  initBlocker();
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'blocksUpdated') {
    console.log('[Blocker] Blocks updated, refreshing...');
    checkAndEnforce();
  }
});
