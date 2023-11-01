// This function fetches and returns the content of prompt.html
function fetchPromptHtml() {
    return fetch(chrome.runtime.getURL('prompt.html')).then(response => response.text());
}

// This function injects HTML content into the page
function injectHtml(html) {
    const targetDivs = document.getElementsByClassName('q5O05c oydeSd');
    if (targetDivs.length > 0) {
        const targetDiv = targetDivs[0];
        const container = document.createElement('div');
        container.innerHTML = html;
        targetDiv.parentNode.insertBefore(container, targetDiv.nextSibling);
        setUpButtonListener();
    }
}

// Sets up the click event listener for the "Search your result" button
function setUpButtonListener() {
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
        searchButton.addEventListener('click', function () {
            const userInput = document.getElementById('prompt').value;
            const promptTypeSelect = document.getElementById('promptTypeSelect');
            const promptType = promptTypeSelect.options[promptTypeSelect.selectedIndex].value;
            handleSearch(userInput, promptType);
        });
    }
}

// Handles the search operation
function handleSearch(userPrompt, promptType) {
    if (!userPrompt) {
        alert('Please enter a prompt.');
        return;
    }
    console.log("User Prompt and Type : " + userPrompt, promptType)
    const apiURL = 'https://json.extendsclass.com/bin/f025a19c05d3';
    // Prepare the data to send in the API call
    // const dataToSend = { prompt: userPrompt };

    fetch(apiURL, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            // Handle the response data
            // You can display the result or do whatever is needed with the data
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

// When the DOM is fully loaded, fetch prompt.html and inject it
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        fetchPromptHtml().then(html => injectHtml(html));
    });
} else {
    fetchPromptHtml().then(html => injectHtml(html));
}
