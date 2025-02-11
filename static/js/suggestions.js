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
    // Determine which step we're on based on the form ID
    const isPriceStep = document.getElementById('priceForm') !== null;
    const isCostStep = document.getElementById('costForm') !== null;
    const step = isPriceStep ? 'price' : (isCostStep ? 'cost' : null);
    
    if (!step) {
        console.error('Could not determine current step');
        return;
    }

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
        const response = await fetch('/product/get_ai_suggestion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                step: step
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        while (true) {
            const {value, done} = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        if (data.error) {
                            throw new Error(data.error);
                        }
                        if (data.content) {
                            fullResponse += data.content;
                            suggestionText.textContent = fullResponse;
                            
                            // Check if we've received the final suggestion
                            if (fullResponse.includes('FINAL SUGGESTION: $')) {
                                loadingSpinner.style.display = 'none';
                                useSuggestionBtn.style.display = 'block';
                            }
                        }
                    } catch (e) {
                        console.error('Error parsing chunk:', e);
                    }
                }
            }
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
