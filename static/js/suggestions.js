console.log('Suggestions.js loaded');

function extractNumber(text) {
    console.log('Extracting number from:', text);
    
    // First try to find the FINAL SUGGESTION format
    const finalSuggestionMatch = text.match(/FINAL SUGGESTION:\s*\$\s*([\d,]+(\.\d{2})?)/i);
    if (finalSuggestionMatch) {
        console.log('Found final suggestion:', finalSuggestionMatch[1]);
        return parseFloat(finalSuggestionMatch[1].replace(/,/g, ''));
    }
    
    // If that fails, try to find any number with a dollar sign
    const dollarMatch = text.match(/\$\s*([\d,]+(\.\d{2})?)/);
    if (dollarMatch) {
        console.log('Found dollar amount:', dollarMatch[1]);
        return parseFloat(dollarMatch[1].replace(/,/g, ''));
    }
    
    // If that fails, try to find any number
    const numberMatch = text.match(/([\d,]+(\.\d{2})?)/);
    if (numberMatch) {
        console.log('Found number:', numberMatch[1]);
        return parseFloat(numberMatch[1].replace(/,/g, ''));
    }
    
    console.log('No number found in text');
    return null;
}

function useSuggestion(suggestionText, inputId) {
    console.log('Using suggestion:', suggestionText, 'for input:', inputId);
    const number = extractNumber(suggestionText);
    console.log('Extracted number:', number);
    
    if (number !== null) {
        const input = document.getElementById(inputId);
        if (input) {
            console.log('Found input element, setting value to:', number);
            input.value = number;
            input.classList.add('suggestion-used');
            setTimeout(() => input.classList.remove('suggestion-used'), 1000);
        } else {
            console.error('Input element not found:', inputId);
            alert('Technical error: Could not find the input field.');
        }
    } else {
        alert('Could not find the final suggestion amount. Please enter the value manually.');
    }
}

function getAISuggestion(field = null) {
    const form = document.querySelector('form');
    let suggestionButton;
    
    if (field) {
        // If field is specified, we're getting a suggestion for a specific input
        suggestionButton = form.querySelector(`button[onclick="getAISuggestion('${field}')"]`);
    } else {
        // For backward compatibility with steps 3-5
        suggestionButton = form.querySelector('button[onclick="getAISuggestion()"]');
    }
    
    const submitButton = form.querySelector('button[type="submit"]');
    
    console.log('Getting AI suggestion from:', window.location.href, 'for field:', field);
    
    // Disable buttons while getting suggestion
    if (submitButton) submitButton.disabled = true;
    if (suggestionButton) {
        suggestionButton.disabled = true;
        suggestionButton.innerHTML = 'Getting suggestion...';
    }
    
    // Create form data with get_suggestion flag
    const formData = new FormData(form);
    formData.append('get_suggestion', 'true');
    if (field) {
        formData.append('field', field);
    }
    
    // Send request to current URL
    fetch(window.location.href, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Received response:', data);
        
        // Re-enable buttons
        if (submitButton) submitButton.disabled = false;
        if (suggestionButton) {
            suggestionButton.disabled = false;
            suggestionButton.innerHTML = 'Get AI Suggestion';
        }
        
        if (data.error) {
            console.error('Server returned error:', data.error);
            alert('Error getting suggestion: ' + data.error);
            return;
        }
        
        if (data.suggestion) {
            console.log('Processing suggestion:', data.suggestion);
            if (field) {
                // For step 6 with individual field suggestions
                useSuggestion(data.suggestion, field);
            } else {
                // For steps 3-5 with single input
                const inputId = form.querySelector('input[type="number"]').id;
                console.log('Target input ID:', inputId);
                useSuggestion(data.suggestion, inputId);
            }
        }
    })
    .catch(error => {
        console.error('Network or parsing error:', error);
        alert('Error getting AI suggestion. Please try again.');
        
        // Re-enable buttons
        if (submitButton) submitButton.disabled = false;
        if (suggestionButton) {
            suggestionButton.disabled = false;
            suggestionButton.innerHTML = 'Get AI Suggestion';
        }
    });
}
