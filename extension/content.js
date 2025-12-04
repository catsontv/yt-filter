// Content script for YouTube pages
console.log('YouTube Monitor: Content script loaded');

let currentVideoId = null;
let videoDetected = false;

// Detect when user navigates to a video page
function detectVideoPage() {
  const url = window.location.href;
  
  // Check if we're on a video page
  if (url.includes('youtube.com/watch')) {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('v');
    
    if (videoId && videoId !== currentVideoId) {
      currentVideoId = videoId;
      extractVideoData();
    }
  } else {
    currentVideoId = null;
    videoDetected = false;
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
      
      // Get channel name
      const channelElement = document.querySelector('ytd-channel-name a');
      const channelName = channelElement ? channelElement.textContent.trim() : 'Unknown Channel';
      const channelUrl = channelElement ? channelElement.href : '';
      
      // Get thumbnail
      const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
      
      const videoData = {
        videoId,
        title,
        channelName,
        channelUrl,
        videoUrl,
        thumbnailUrl,
      };
      
      console.log('Video data extracted:', videoData);
      
      // Send to background script
      chrome.runtime.sendMessage({
        type: 'VIDEO_DETECTED',
        data: videoData,
      });
      
      videoDetected = true;
      
    } catch (error) {
      console.error('Error extracting video data:', error);
    }
  }, 2000); // Wait 2 seconds for page to fully load
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

// Initial detection
detectVideoPage();
