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

async function getAISuggestion() {
    // Show the suggestion area and loading spinner
    const suggestionArea = document.getElementById('suggestionArea');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const suggestionText = document.getElementById('suggestionText');
    const useSuggestionBtn = document.getElementById('useSuggestionBtn');

    if (!suggestionArea || !loadingSpinner || !suggestionText || !useSuggestionBtn) {
        console.error('Required elements not found');
        return;
    }

    suggestionArea.style.display = 'block';
    loadingSpinner.style.display = 'block';
    suggestionText.textContent = '';
    useSuggestionBtn.style.display = 'none';

    try {
        // Get the current form data
        const form = document.getElementById('priceForm');
        const formData = new FormData(form);
        const productDescription = sessionStorage.getItem('productDescription') || '';
        const targetAudience = sessionStorage.getItem('targetAudience') || '';
        const location = sessionStorage.getItem('location') || '';

        const response = await fetch('/product/get_ai_suggestion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                step: 'price',
                product_description: productDescription,
                target_audience: targetAudience,
                location: location
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        // Hide loading spinner and show the suggestion
        loadingSpinner.style.display = 'none';
        suggestionText.textContent = data.suggestion;
        
        // Only show the "Use Suggestion" button if we could extract a number
        if (extractNumber(data.suggestion) !== null) {
            useSuggestionBtn.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Error:', error);
        loadingSpinner.style.display = 'none';
        suggestionText.textContent = 'Error getting suggestion. Please try again.';
    }
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
