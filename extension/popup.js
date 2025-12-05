// Popup script

// Load device info
async function loadDeviceInfo() {
  try {
    // Get device info from background
    chrome.runtime.sendMessage({ type: 'GET_DEVICE_ID' }, async (response) => {
      if (response && response.deviceId) {
        document.getElementById('deviceId').textContent = response.deviceId;
        document.getElementById('deviceName').textContent = response.deviceName || 'Unknown Device';
        
        // Update status
        const statusDiv = document.getElementById('status');
        if (response.isRegistered) {
          statusDiv.className = 'status connected';
          statusDiv.innerHTML = '<div>✅ Connected to Desktop App</div>';
        } else {
          statusDiv.className = 'status disconnected';
          statusDiv.innerHTML = '<div>❌ Not Registered</div>';
        }
      }
    });
    
    // Get buffer count
    const stored = await chrome.storage.local.get(['watchHistory']);
    const bufferCount = (stored.watchHistory || []).length;
    document.getElementById('bufferCount').textContent = bufferCount;
    
  } catch (error) {
    console.error('Error loading device info:', error);
  }
}

// Manual sync button
document.getElementById('syncBtn').addEventListener('click', async () => {
  const btn = document.getElementById('syncBtn');
  btn.disabled = true;
  btn.textContent = 'Syncing...';
  
  chrome.runtime.sendMessage({ type: 'MANUAL_SYNC' }, (response) => {
    if (response && response.success) {
      btn.textContent = '✅ Synced!';
      setTimeout(() => {
        btn.textContent = 'Sync Now';
        btn.disabled = false;
        loadDeviceInfo(); // Refresh buffer count
      }, 2000);
    } else {
      btn.textContent = '❌ Failed';
      setTimeout(() => {
        btn.textContent = 'Sync Now';
        btn.disabled = false;
      }, 2000);
    }
  });
});

// Load on popup open
loadDeviceInfo();
