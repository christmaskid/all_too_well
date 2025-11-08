// Function to click radio buttons with the specified value
function clickRadioButtons(value) {
    // Find all radio buttons with the specified value
    const radioButtons = document.querySelectorAll(`input[type="radio"][value="${value}"]`);
    console.log('Found', radioButtons.length, `radio buttons with value=${value}`);
    
    // Click each radio button
    radioButtons.forEach(radio => {
        try {
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
        } catch (error) {
            console.error('Error clicking radio button:', error);
        }
    });
}

// Export the function so it can be called from popup.js
window.clickRadioButtons = clickRadioButtons;