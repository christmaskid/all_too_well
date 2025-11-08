document.addEventListener('DOMContentLoaded', function() {
    // document.getElementById('clickRadios').addEventListener('click', function() {
    const radioValue = document.getElementById('radioValue').value;
    // Get the active tab and execute the content script function
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: (value) => {
                // The clickRadioButtons function is already available in the page context
                // through the content script
                window.clickRadioButtons(value);
            },
            args: [radioValue]
        });
    });
    // });
});