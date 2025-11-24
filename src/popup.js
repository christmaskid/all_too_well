function clickRadioButtonsWrapper() {
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
    document.getElementById('clickRadios')
        .addEventListener('click', clickRadioButtonsWrapper);

    const isRedcap = await checkTabURL();
    console.log('checkTabURL result =', isRedcap);
    if (isRedcap) {
        clickRadioButtonsWrapper();
    }
});
