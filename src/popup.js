function clickRadioButtonsWrapper() {
    const radioValue = document.getElementById('radioValue').value;
    // Get the active tab and execute the content script function
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: (value) => {
                // The clickRadioButtons function is already available in the page context
                // through the content script
                const clickedCount = window.clickRadioButtons(value);
                console.log(`手動執行：填入了 ${clickedCount} 個選項`);
            },
            args: [radioValue]
        });
    });
}

// Save settings function
async function saveSettings() {
    const autoMode = document.getElementById('autoMode').checked;
    const autopilotMode = document.getElementById('autopilotMode').checked;
    const defaultValue = document.getElementById('radioValue').value;
    
    try {
        await chrome.storage.sync.set({
            autoMode: autoMode,
            autopilotMode: autopilotMode,
            defaultValue: defaultValue
        });
        
        // Show feedback
        const button = document.getElementById('saveSettings');
        const originalText = button.textContent;
        button.textContent = '已儲存！';
        button.style.backgroundColor = '#4CAF50';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = '#2196F3';
        }, 1000);
        
        console.log('Settings saved:', { autoMode, autopilotMode, defaultValue });
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

// Load settings function
async function loadSettings() {
    try {
        const result = await chrome.storage.sync.get(['autoMode', 'autopilotMode', 'defaultValue']);
        
        document.getElementById('autoMode').checked = result.autoMode ?? false;
        document.getElementById('autopilotMode').checked = result.autopilotMode ?? false;
        document.getElementById('radioValue').value = result.defaultValue ?? '2';
        
        console.log('Settings loaded:', result);
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Check if current tab is a RedCap survey page
function checkTabURL() {
    return new Promise((resolve) => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            let isRedcap = false;

            var allow_host = "redcap.mc.ntu.edu.tw";
            var allow_path_prefix = "/surveys/";
            var show_div_name = "redcap-div";
            var hide_div_name = "non-applicable-site";
            
            if (!tabs || !tabs[0] || !tabs[0].url) {
                document.querySelector('.' + show_div_name).style.display = 'none';
                document.querySelector('.' + hide_div_name).style.display = 'block';
                console.log("No active tab or URL found.");
                resolve(false);
                return;
            }

            try {
                const url = new URL(tabs[0].url);
                console.log("Current tab URL:", url.hostname, url.pathname);

                if (url.hostname === allow_host &&
                    url.pathname.startsWith(allow_path_prefix)) {
                    document.querySelector('.' + show_div_name).style.display = 'block';
                    document.querySelector('.' + hide_div_name).style.display = 'none';
                    console.log("This is a RedCap survey page.");
                    isRedcap = true;
                } else {
                    document.querySelector('.' + show_div_name).style.display = 'none';
                    document.querySelector('.' + hide_div_name).style.display = 'block';
                    console.log("This is NOT a RedCap survey page.");
                }
            } catch (e) {
                console.error(e);
                document.querySelector('.' + show_div_name).style.display = 'none';
                document.querySelector('.' + hide_div_name).style.display = 'block';
                isRedcap = false;
            }

            resolve(isRedcap);
        });
    });
}

document.addEventListener('DOMContentLoaded', async function () {
    // Load settings first
    await loadSettings();
    
    // Set up event listeners
    document.getElementById('clickRadios')
        .addEventListener('click', clickRadioButtonsWrapper);
    
    document.getElementById('saveSettings')
        .addEventListener('click', saveSettings);

    // Check if we're on a RedCap page
    const isRedcap = await checkTabURL();
    console.log('checkTabURL result =', isRedcap);
    
    // Show current auto mode status
    if (isRedcap) {
        const result = await chrome.storage.sync.get(['autoMode']);
        if (result.autoMode) {
            console.log('自動模式已開啟，會在頁面載入時自動填入');
        }
    }
});
