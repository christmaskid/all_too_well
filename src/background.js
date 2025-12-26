// Background script for RedCap問卷小幫手

// Initialize default settings when extension is installed
chrome.runtime.onInstalled.addListener(async () => {
    // Set default settings
    const result = await chrome.storage.sync.get(['autoMode', 'defaultValue']);
    
    if (result.autoMode === undefined) {
        await chrome.storage.sync.set({
            autoMode: false,
            defaultValue: '2'
        });
        console.log('Initialized default settings');
    }
});

// Listen for tab updates to potentially trigger auto-fill
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Only act when the page is completely loaded
    if (changeInfo.status === 'complete' && tab.url) {
        // Check if it's a RedCap survey URL
        if (tab.url.includes('redcap.mc.ntu.edu.tw/surveys/')) {
            console.log('RedCap survey page loaded:', tab.url);
            // The content script will handle auto-fill based on settings
        }
    }
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSettings') {
        chrome.storage.sync.get(['autoMode', 'defaultValue']).then(result => {
            sendResponse(result);
        });
        return true; // Will respond asynchronously
    }
    
    if (request.action === 'updateSettings') {
        chrome.storage.sync.set(request.settings).then(() => {
            console.log('Settings updated:', request.settings);
            sendResponse({ success: true });
        });
        return true; // Will respond asynchronously
    }
});