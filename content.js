// YouTube Filter - Content Script
// Disables video seeking (timeline/progress bar) and limits video repeats

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

  // Disable video seeking (progress bar/timeline)
  function disableSeeking() {
    const video = document.querySelector('video');
    if (!video) return;

    let lastValidTime = 0;

    // Prevent seeking via progress bar
    video.addEventListener('seeking', (e) => {
      if (video.currentTime !== lastValidTime) {
        video.currentTime = lastValidTime;
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);

    video.addEventListener('seeked', (e) => {
      if (video.currentTime !== lastValidTime) {
        video.currentTime = lastValidTime;
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);

    // Update valid time as video plays normally
    video.addEventListener('timeupdate', () => {
      if (!video.seeking) {
        lastValidTime = video.currentTime;
      }
    });

    // Disable keyboard shortcuts for seeking (arrow keys, numbers)
    document.addEventListener('keydown', (e) => {
      // Arrow keys, J, L, 0-9 keys used for seeking
      const seekKeys = ['ArrowLeft', 'ArrowRight', 'j', 'l', 'J', 'L', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
      if (seekKeys.includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);

    // Hide and disable the progress bar visually
    const progressBar = document.querySelector('.ytp-progress-bar-container');
    if (progressBar) {
      progressBar.style.pointerEvents = 'none';
      progressBar.style.opacity = '0.5';
      progressBar.style.cursor = 'not-allowed';
    }

    // Prevent clicks on the progress bar
    const observer = new MutationObserver(() => {
      const progressBar = document.querySelector('.ytp-progress-bar-container');
      if (progressBar && progressBar.style.pointerEvents !== 'none') {
        progressBar.style.pointerEvents = 'none';
        progressBar.style.opacity = '0.5';
        progressBar.style.cursor = 'not-allowed';
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
    checkVideoRepeat();
    
    // Wait for video element to load
    const videoCheckInterval = setInterval(() => {
      const video = document.querySelector('video');
      if (video) {
        disableSeeking();
        clearInterval(videoCheckInterval);
      }
    }, 500);

    // Monitor URL changes (YouTube is a SPA)
    let lastUrl = location.href;
    new MutationObserver(() => {
      const currentUrl = location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        checkVideoRepeat();
        
        // Re-apply seeking disable on new video
        setTimeout(() => {
          const video = document.querySelector('video');
          if (video) {
            disableSeeking();
          }
        }, 1000);
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