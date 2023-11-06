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

// function handleSearch(userPrompt, promptType) {
//     if (!userPrompt) {
//         alert('Please enter a prompt.');
//         return;
//     }
//     console.log("User Prompt and Type : " + userPrompt, promptType)
//     const apiURL = 'https://prompt-enhancer.onrender.com/api/v1/suffix/promptAdd/';
//     // Prepare the data to send in the API call
//     const dataToSend = { prompt: userPrompt };

//     fetch(apiURL, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(dataToSend)
//     })
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }
//             return response.json();
//         })
//         .then(data => {
//             console.log('Success:', data);
//         })
//         .catch((error) => {
//             console.error('Error:', error);
//         });
// }

function handleSearch(userPrompt, promptType) {
    if (!userPrompt) {
        alert('Please enter a prompt.');
        return;
    }
    console.log("User Prompt and Type : " + userPrompt, promptType);

    // Send message to background script
    chrome.runtime.sendMessage({ userPrompt: userPrompt }, function (response) {
        console.log('Success:', response);
        console.log('Success:', response.data.finalPrompt);
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
