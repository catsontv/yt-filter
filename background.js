// YouTube Filter - Background Service Worker

chrome.runtime.onInstalled.addListener(() => {
  console.log('YouTube Filter extension installed');
  
  // Initialize storage if needed
  chrome.storage.local.get(['videoWatchCount'], (result) => {
    if (!result.videoWatchCount) {
      chrome.storage.local.set({ videoWatchCount: {} });
    }
  });
});

// Optional: Add context menu to reset watch count
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'resetWatchCount',
    title: 'Reset Video Watch Count',
    contexts: ['page'],
    documentUrlPatterns: ['https://www.youtube.com/*']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'resetWatchCount') {
    chrome.storage.local.set({ videoWatchCount: {} }, () => {
      console.log('Watch count reset');
      chrome.tabs.reload(tab.id);
    });
  }
});