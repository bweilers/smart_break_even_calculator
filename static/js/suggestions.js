console.log('Suggestions.js loaded');

function extractNumber(text) {
    console.log('Extracting number from:', text);
    
    // Look for the final suggestion format: "FINAL SUGGESTION: $X,XXX.XX"
    const finalSuggestionMatch = text.match(/FINAL SUGGESTION:\s*\$\s*([\d,]+(\.\d{2})?)/i);
    if (finalSuggestionMatch) {
        console.log('Found final suggestion:', finalSuggestionMatch[1]);
        return parseFloat(finalSuggestionMatch[1].replace(/,/g, ''));
    }
    
    console.log('No final suggestion found in structured format');
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
