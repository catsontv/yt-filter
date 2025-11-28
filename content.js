// YouTube Filter - Content Script
// Disables timelapse controls and limits video repeats

(function() {
  'use strict';

  const MAX_REPEATS = 3;
  let currentVideoId = null;
  let videoWatchCount = {};

  // Load watch count from storage
  chrome.storage.local.get(['videoWatchCount'], function(result) {
    if (result.videoWatchCount) {
      videoWatchCount = result.videoWatchCount;
    }
  });

  // Save watch count to storage
  function saveWatchCount() {
    chrome.storage.local.set({ videoWatchCount: videoWatchCount });
  }

  // Extract video ID from URL
  function getVideoId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('v');
  }

  // Disable timelapse/playback speed controls
  function disableTimelapse() {
    const observer = new MutationObserver(() => {
      // Hide playback speed button
      const settingsButton = document.querySelector('.ytp-settings-button');
      if (settingsButton) {
        settingsButton.addEventListener('click', () => {
          setTimeout(() => {
            const playbackRateOption = document.querySelector('.ytp-panel-menu [role="menuitem"]:has(.ytp-menuitem-label:contains("Playback speed"))');
            if (playbackRateOption) {
              playbackRateOption.style.display = 'none';
            }
            // Alternative selector
            const panels = document.querySelectorAll('.ytp-panel-menu .ytp-menuitem');
            panels.forEach(panel => {
              const label = panel.querySelector('.ytp-menuitem-label');
              if (label && (label.textContent.includes('Playback speed') || label.textContent.includes('velocidad'))) {
                panel.style.display = 'none';
              }
            });
          }, 100);
        });
      }

      // Disable keyboard shortcuts for speed adjustment
      const video = document.querySelector('video');
      if (video) {
        video.playbackRate = 1.0;
        // Prevent speed changes
        Object.defineProperty(video, 'playbackRate', {
          get: function() { return 1.0; },
          set: function(value) { return 1.0; }
        });
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Check and enforce video repeat limit
  function checkVideoRepeat() {
    const videoId = getVideoId();
    
    if (!videoId) return;
    
    // New video detected
    if (videoId !== currentVideoId) {
      currentVideoId = videoId;
      
      // Initialize count if not exists
      if (!videoWatchCount[videoId]) {
        videoWatchCount[videoId] = 0;
      }
      
      videoWatchCount[videoId]++;
      saveWatchCount();
      
      console.log(`Video ${videoId} watched ${videoWatchCount[videoId]} time(s)`);
      
      // Check if limit exceeded
      if (videoWatchCount[videoId] > MAX_REPEATS) {
        showWarning();
        // Redirect to YouTube home after 3 seconds
        setTimeout(() => {
          window.location.href = 'https://www.youtube.com';
        }, 3000);
      }
    }
  }

  // Show warning overlay
  function showWarning() {
    const overlay = document.createElement('div');
    overlay.id = 'yt-filter-warning';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: Arial, sans-serif;
    `;
    
    const message = document.createElement('div');
    message.style.cssText = `
      text-align: center;
      padding: 40px;
      background: #282828;
      border-radius: 8px;
    `;
    message.innerHTML = `
      <h2 style="font-size: 24px; margin-bottom: 16px;">⚠️ Video Repeat Limit Reached</h2>
      <p style="font-size: 16px; margin-bottom: 8px;">You've watched this video ${MAX_REPEATS} times.</p>
      <p style="font-size: 14px; color: #aaa;">Redirecting to home page...</p>
    `;
    
    overlay.appendChild(message);
    document.body.appendChild(overlay);
  }

  // Initialize on page load
  function init() {
    disableTimelapse();
    checkVideoRepeat();
    
    // Monitor URL changes (YouTube is a SPA)
    let lastUrl = location.href;
    new MutationObserver(() => {
      const currentUrl = location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        checkVideoRepeat();
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  // Wait for page to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();