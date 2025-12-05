// Content script for YouTube pages
console.log('YouTube Monitor: Content script loaded');

let currentVideoId = null;
let videoStartTime = null;
let videoDataCache = null;
let isVideoReported = false;

const MIN_WATCH_TIME = 15000; // 15 seconds in milliseconds

// Detect when user navigates to a video page
function detectVideoPage() {
  const url = window.location.href;
  
  // Check if we're on a video page
  if (url.includes('youtube.com/watch')) {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('v');
    
    if (videoId && videoId !== currentVideoId) {
      // New video detected
      console.log('New video detected:', videoId);
      currentVideoId = videoId;
      videoStartTime = Date.now();
      isVideoReported = false;
      videoDataCache = null;
      extractVideoData();
    }
  } else {
    // User left video page
    currentVideoId = null;
    videoStartTime = null;
    isVideoReported = false;
    videoDataCache = null;
  }
}

// Extract video metadata
function extractVideoData() {
  // Wait a bit for page to load
  setTimeout(() => {
    try {
      const videoId = currentVideoId;
      const videoUrl = window.location.href;
      
      // Get video title
      const titleElement = document.querySelector('h1.ytd-watch-metadata yt-formatted-string');
      const title = titleElement ? titleElement.textContent.trim() : 'Unknown Title';
      
      // Get channel name and ID
      const channelElement = document.querySelector('ytd-channel-name a');
      const channelName = channelElement ? channelElement.textContent.trim() : 'Unknown Channel';
      const channelUrl = channelElement ? channelElement.href : '';
      
      // Extract channel ID from URL
      let channelId = '';
      if (channelUrl) {
        const channelMatch = channelUrl.match(/\/(channel|c|user|@)\/(.*?)(?:\/|$)/);
        if (channelMatch) {
          channelId = channelMatch[2];
        }
      }
      
      // Get thumbnail - use the current video's thumbnail
      const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
      
      // Get video duration if available
      const durationElement = document.querySelector('.ytp-time-duration');
      const duration = durationElement ? durationElement.textContent : null;
      
      // Cache the video data
      videoDataCache = {
        videoId,
        title,
        channelName,
        channelId,
        channelUrl,
        videoUrl,
        thumbnailUrl,
        duration,
      };
      
      console.log('Video data cached:', videoDataCache);
      
      // Start watching for minimum watch time
      checkMinimumWatchTime();
      
    } catch (error) {
      console.error('Error extracting video data:', error);
    }
  }, 2000); // Wait 2 seconds for page to fully load
}

// Check if user has watched video for minimum time
function checkMinimumWatchTime() {
  if (!currentVideoId || !videoStartTime || isVideoReported) {
    return;
  }
  
  const watchedTime = Date.now() - videoStartTime;
  
  if (watchedTime >= MIN_WATCH_TIME) {
    // User has watched for minimum time, report it
    reportVideoWatch();
  } else {
    // Check again in 1 second
    setTimeout(checkMinimumWatchTime, 1000);
  }
}

// Report video watch to background script
function reportVideoWatch() {
  if (isVideoReported || !videoDataCache) {
    return;
  }
  
  isVideoReported = true;
  console.log('Reporting video watch (15+ seconds):', videoDataCache.title);
  
  // Send to background script
  chrome.runtime.sendMessage({
    type: 'VIDEO_DETECTED',
    data: videoDataCache,
  });
}

// Listen for URL changes (YouTube is a SPA)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    detectVideoPage();
  }
}).observe(document, { subtree: true, childList: true });

// Also listen for video player state changes
try {
  // Try to hook into YouTube's player
  const checkPlayer = setInterval(() => {
    const player = document.querySelector('.html5-video-player');
    if (player) {
      clearInterval(checkPlayer);
      
      // Listen for play events
      const video = document.querySelector('video');
      if (video) {
        video.addEventListener('play', () => {
          if (currentVideoId && !isVideoReported) {
            console.log('Video playing, checking watch time...');
            checkMinimumWatchTime();
          }
        });
        
        video.addEventListener('pause', () => {
          console.log('Video paused');
        });
      }
    }
  }, 1000);
  
  // Clear interval after 10 seconds if player not found
  setTimeout(() => clearInterval(checkPlayer), 10000);
} catch (error) {
  console.error('Error setting up player listeners:', error);
}

// Initial detection
detectVideoPage();
