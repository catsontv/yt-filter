// Configuration (inlined to avoid import issues)
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

// Helper to get credentials from storage (Service Workers lose in-memory state)
async function getCredentials() {
  const stored = await chrome.storage.local.get(['deviceId', 'deviceName', 'apiKey', 'isRegistered']);
  return {
    deviceId: stored.deviceId || null,
    deviceName: stored.deviceName || null,
    apiKey: stored.apiKey || null,
    isRegistered: stored.isRegistered || false
  };
}

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
  console.log('YouTube Monitor Extension Installed');
  await initializeDevice();
  setupAlarms();
});

// Initialize on startup
chrome.runtime.onStartup.addListener(async () => {
  console.log('YouTube Monitor Extension Started');
  await initializeDevice();
  setupAlarms();
});

// Generate or retrieve device ID
async function initializeDevice() {
  const creds = await getCredentials();
  
  if (creds.deviceId) {
    console.log('Device ID loaded:', creds.deviceId);
    console.log('API Key loaded:', creds.apiKey ? '✓' : '✗');
    console.log('Registered:', creds.isRegistered);
  } else {
    // Generate new UUID
    const deviceId = generateUUID();
    const deviceName = await generateDeviceName();
    await chrome.storage.local.set({ deviceId, deviceName, isRegistered: false });
    console.log('New Device ID created:', deviceId);
  }
  
  // Try to register if not already registered
  if (!creds.isRegistered) {
    await registerDevice();
  }
}

// Generate UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Generate device name based on browser and OS
async function generateDeviceName() {
  const ua = navigator.userAgent;
  let os = 'Unknown';
  let browser = 'Chrome';
  
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'Mac';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  
  return `${browser} on ${os}`;
}

// Register device with desktop app
async function registerDevice() {
  const creds = await getCredentials();
  if (!creds.deviceId) return;
  
  try {
    const response = await fetch(getApiEndpoint('/register'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        device_id: creds.deviceId,
        device_name: creds.deviceName,
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Device registered successfully:', data);
      
      // Store API key and registration status
      await chrome.storage.local.set({ 
        apiKey: data.api_key,
        isRegistered: true 
      });
      
      console.log('API key stored successfully');
      
      // Start heartbeat immediately after registration
      sendHeartbeat();
    } else {
      console.error('Registration failed:', response.status);
    }
  } catch (error) {
    console.error('Registration error:', error);
  }
}

// Setup periodic alarms
function setupAlarms() {
  // Heartbeat alarm (every 60 seconds)
  chrome.alarms.create('heartbeat', { periodInMinutes: 1 });
  
  // Sync alarm (every 10 minutes)
  chrome.alarms.create('sync', { periodInMinutes: 10 });
  
  console.log('Alarms configured');
}

// Handle alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'heartbeat') {
    await sendHeartbeat();
  } else if (alarm.name === 'sync') {
    await syncWatchHistory();
  }
});

// Send heartbeat to desktop app
async function sendHeartbeat() {
  const creds = await getCredentials();
  
  if (!creds.deviceId || !creds.isRegistered || !creds.apiKey) {
    console.log('Heartbeat skipped: missing credentials', {
      hasDeviceId: !!creds.deviceId,
      isRegistered: creds.isRegistered,
      hasApiKey: !!creds.apiKey
    });
    return;
  }
  
  try {
    const response = await fetch(getApiEndpoint(`/heartbeat/${creds.deviceId}`), {
      method: 'GET',
      headers: {
        'X-API-Key': creds.apiKey,
      },
    });
    
    if (response.ok) {
      console.log('Heartbeat sent successfully');
    } else {
      console.error('Heartbeat failed:', response.status);
      
      // If 401, try re-registering
      if (response.status === 401) {
        console.log('API key invalid, attempting re-registration...');
        await chrome.storage.local.set({ isRegistered: false });
        await registerDevice();
      }
    }
  } catch (error) {
    console.error('Heartbeat error:', error);
  }
}

// Sync watch history to desktop app
async function syncWatchHistory() {
  const creds = await getCredentials();
  
  if (!creds.deviceId || !creds.isRegistered || !creds.apiKey) {
    console.log('Sync skipped: missing credentials', {
      hasDeviceId: !!creds.deviceId,
      isRegistered: creds.isRegistered,
      hasApiKey: !!creds.apiKey
    });
    return;
  }
  
  try {
    // Get unsynced history from storage
    const stored = await chrome.storage.local.get(['watchHistory']);
    const watchHistory = stored.watchHistory || [];
    
    if (watchHistory.length === 0) {
      console.log('No watch history to sync');
      return;
    }
    
    console.log(`Syncing ${watchHistory.length} videos to desktop app...`);
    
    // Prepare videos array for batch submission
    const videos = watchHistory.map(video => ({
      video_id: video.videoId,
      title: video.title,
      channel_name: video.channelName,
      channel_id: video.channelId,
      thumbnail_url: video.thumbnailUrl,
      video_url: video.videoUrl,
      watched_at: video.watchedAt,
      duration: video.duration
    }));
    
    console.log('Sending videos:', videos);
    
    // Send batch to desktop app
    const response = await fetch(getApiEndpoint('/watch-history'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': creds.apiKey,
      },
      body: JSON.stringify({
        videos: videos
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Sync response:', result);
      
      // Clear synced history
      await chrome.storage.local.set({ watchHistory: [] });
      console.log('Watch history synced successfully');
    } else {
      const errorText = await response.text();
      console.error('Failed to sync watch history:', response.status, errorText);
      
      // If 401, try re-registering
      if (response.status === 401) {
        console.log('API key invalid, attempting re-registration...');
        await chrome.storage.local.set({ isRegistered: false });
        await registerDevice();
      }
    }
  } catch (error) {
    console.error('Sync error:', error);
  }
}

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'VIDEO_DETECTED') {
    handleVideoDetected(message.data);
  } else if (message.type === 'GET_DEVICE_ID') {
    getCredentials().then(creds => {
      sendResponse({ 
        deviceId: creds.deviceId, 
        deviceName: creds.deviceName, 
        isRegistered: creds.isRegistered 
      });
    });
    return true;
  } else if (message.type === 'MANUAL_SYNC') {
    syncWatchHistory().then(() => {
      sendResponse({ success: true });
    });
    return true; // Keep channel open for async response
  }
  return true;
});

// Handle video detection from content script
async function handleVideoDetected(videoData) {
  console.log('Video detected:', videoData.title);
  
  // Get current watch history
  const stored = await chrome.storage.local.get(['watchHistory']);
  let watchHistory = stored.watchHistory || [];
  
  // Add timestamp
  videoData.watchedAt = Date.now();
  
  // Add to buffer
  watchHistory.push(videoData);
  
  // Save to storage
  await chrome.storage.local.set({ watchHistory });
  
  console.log(`Video buffered. Total in buffer: ${watchHistory.length}`);
  
  // Force sync if buffer is full
  if (watchHistory.length >= CONFIG.MAX_HISTORY_BUFFER) {
    console.log('Buffer full, forcing sync...');
    await syncWatchHistory();
  }
}
