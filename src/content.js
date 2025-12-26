// Function to click radio buttons with the specified value
function clickRadioButtons(value) {
    // Find all radio buttons with the specified value
    const radioButtons = document.querySelectorAll(`input[type="radio"][value="${value}"]`);
    console.log('Found', radioButtons.length, `radio buttons with value=${value}`);
    
    let clickedCount = 0;
    // Click each radio button
    radioButtons.forEach(radio => {
        try {
            // Only click if not already selected
            if (!radio.checked) {
                // Set checked state
                radio.checked = true;

                // Get the name of the form field from the radio button's name
                const fieldName = radio.name.split('___')[0];  // Splits "method_103___radio" to get "method_103"
                
                // Find the form and set its value
                if (document.forms['form'] && fieldName) {
                    document.forms['form'][fieldName].value = radio.value;
                    console.log(`Set form field ${fieldName} to value ${radio.value}`);
                }
                
                console.log('Clicked radio button:', radio);
                clickedCount++;
            }
        } catch (error) {
            console.error('Error clicking radio button:', error);
        }
    });
    
    return clickedCount;
}

// Function to click submit button if it exists
function clickSubmitButton() {
    console.log("Attempting to click submit button");
    // Look for button with name="submit-btn-saverecord"
    const submitButton = document.querySelector('button[name="submit-btn-saverecord"]');
    
    if (submitButton) {
        try {
            submitButton.click();
            console.log('Clicked submit button:', submitButton);
            showNotification('已自動提交表單');
            return true;
        } catch (error) {
            console.error('Error clicking submit button:', error);
            return false;
        }
    } else {
        console.log('No submit button with name="submit-btn-saverecord" found');
        return false;
    }
}

// Check if current page is a RedCap survey
function isRedCapSurvey() {
    const url = window.location.href;
    return url.includes('redcap.mc.ntu.edu.tw/surveys/');
}

// Auto-fill function that runs based on settings
async function autoFillIfEnabled() {
    if (!isRedCapSurvey()) {
        console.log('Not a RedCap survey page, skipping auto-fill');
        return;
    }

    try {
        // Get settings from storage
        const result = await chrome.storage.sync.get(['autoMode', 'autopilotMode', 'defaultValue']);
        const autoMode = result.autoMode ?? false;
        const autopilotMode = result.autopilotMode ?? false;
        const defaultValue = result.defaultValue ?? '2';
        
        console.log('Auto mode:', autoMode, 'Autopilot mode:', autopilotMode, 'Default value:', defaultValue);
        
        if (autoMode) {
            // Wait a bit for page to fully load
            setTimeout(() => {
                const clickedCount = clickRadioButtons(defaultValue);
                if (clickedCount > 0) {
                    console.log(`Auto-filled ${clickedCount} radio buttons with value ${defaultValue}`);
                    
                    // Show a subtle notification
                    showNotification(`已自動填入 ${clickedCount} 個選項 (第${defaultValue}欄)`);
                    
                    // If autopilot mode is enabled, click submit button after filling
                    if (autopilotMode) {
                        setTimeout(() => {
                            clickSubmitButton();
                        }, 500);
                    }
                }
            }, 1000);
        }
    } catch (error) {
        console.error('Error in auto-fill:', error);
    }
}

// Show notification function
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans TC', sans-serif;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Export the functions so they can be called from popup.js
window.clickRadioButtons = clickRadioButtons;
window.clickSubmitButton = clickSubmitButton;

// Run auto-fill when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoFillIfEnabled);
} else {
    autoFillIfEnabled();
}

// Also run when navigating (for SPAs)
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        setTimeout(autoFillIfEnabled, 500);
    }
}).observe(document, { subtree: true, childList: true });