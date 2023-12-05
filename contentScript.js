const questions = [
    {
        "type": "multipleChoice",
        "title": "What is the smallest prime number?",
        "options": ["1", "2", "3", "4"],
        "answer": "2",
        "required": true,
        "points": 1,
        "reviewLink": "https://example.com/prime_numbers_review"
    },
    {
        "type": "multipleChoice",
        "title": "Which planet is known as the Red Planet?",
        "options": ["Earth", "Venus", "Mars", "Jupiter"],
        "answer": "Mars",
        "required": true,
        "points": 1,
        "reviewLink": "https://example.com/planets_review"
    },
    {
        "type": "multipleChoice",
        "title": "Who wrote 'To Kill a Mockingbird'?",
        "options": ["Mark Twain", "Harper Lee", "Ernest Hemingway", "Jane Austen"],
        "answer": "Harper Lee",
        "required": true,
        "points": 1,
        "reviewLink": "https://example.com/literature_review"
    },
    {
        "type": "multipleChoice",
        "title": "In which year did the World War II end?",
        "options": ["1941", "1945", "1950", "1960"],
        "answer": "1945",
        "required": true,
        "points": 1,
        "reviewLink": "https://example.com/history_review"
    },
    {
        "type": "multipleChoice",
        "title": "What is the chemical symbol for gold?",
        "options": ["Au", "Ag", "Fe", "O"],
        "answer": "Au",
        "required": true,
        "points": 1,
        "reviewLink": "https://example.com/chemistry_review"
    },
    {
        "type": "multipleChoice",
        "title": "How many continents are there on Earth?",
        "options": ["5", "6", "7", "8"],
        "answer": "7",
        "required": true,
        "points": 1,
        "reviewLink": "https://example.com/geography_review"
    },
    {
        "type": "multipleChoice",
        "title": "Which gas is most abundant in the Earth's atmosphere?",
        "options": ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
        "answer": "Nitrogen",
        "required": true,
        "points": 1,
        "reviewLink": "https://example.com/environmental_science_review"
    },
    {
        "type": "text",
        "title": "Explain the theory of relativity. (less than 50 words)",
        "required": true,
        "points": 5
    },
    {
        "type": "text",
        "title": "Describe the process of photosynthesis. (less than 50 words)",
        "required": true,
        "points": 5
    },
    {
        "type": "text",
        "title": "Summarize the main events of the French Revolution. (less than 50 words)",
        "required": true,
        "points": 5
    }
]

let currentFormId = null; // This variable will hold the form ID
let currentSheetId = '1ROzHfRXbtNW4n-oDd05o0RmDvEcup3rAxiKcxrtER80'; // This variable will hold the

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "insertAutoCheckButton") {
        insertAutoCheckButton();
    }
    if (message.type === "NEW") {
        currentFormId = message.formId; // Store the form ID
        console.log('Form ID received:', currentFormId);
    }
});



function resetSearchButton() {
    const searchButton = document.getElementById('searchButton');
    const addQuestionsButton = document.getElementById('addQuestionsButton');

    searchButton.style.display = 'inline-block'; // Show search button
    addQuestionsButton.style.display = 'none'; // Hide add questions button

    searchButton.innerText = 'Search your result';
    searchButton.disabled = false;
    searchButton.style.backgroundColor = '#7860bf';
}


function generateUrl(formId, questions) {
    const scriptUrl = "https://script.google.com/a/macros/kiit.ac.in/s/AKfycbzmUChMVYOzNTRwUb1M802iYeYZKZGR4O7iFocYqJBlr_aTTgzTvxemGcNvuAOjm-0/exec";
    var encodedQuestions = encodeURIComponent(JSON.stringify(questions));
    var fullUrl = scriptUrl + "?formId=" + formId + "&questionData=" + encodedQuestions;

    showAddQuestionsButton(fullUrl);
    return fullUrl;
}

function disableSearchButton() {
    const searchButton = document.getElementById('searchButton');
    searchButton.disabled = true;
    searchButton.innerText = 'Searching...'; // Optional: change the button text
    searchButton.style.backgroundColor = '#aaa';
}


function enableSearchButton() {
    const searchButton = document.getElementById('searchButton');
    searchButton.disabled = false;
    searchButton.innerText = 'Search your result'; // Reset the button text
    searchButton.style.backgroundColor = '#7860bf';
}

function showAddQuestionsButton(url) {
    const searchButton = document.getElementById('searchButton');
    const addQuestionsButton = document.getElementById('addQuestionsButton');

    searchButton.style.display = 'none'; // Hide search button
    addQuestionsButton.style.display = 'inline-block'; // Show add questions button

    addQuestionsButton.onclick = function () {
        window.open(url, '_blank'); // Open the URL in a new tab
        resetSearchButton(); // Reset the buttons after opening the URL
    };
}

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


function handleSearch(userPrompt, promptType) {
    if (!userPrompt) {
        alert('Please enter a prompt.');
        return;
    }
    disableSearchButton();

    if (!currentFormId) {
        alert('Form ID has not been received yet.');
        return;
    }

    // Send message to background script for GPT prompt
    chrome.runtime.sendMessage({ userPrompt: userPrompt }, function (response) {
        if (response.error) {
            alert('Error: ' + response.error);
            enableSearchButton();
            return;
        }
        if (response.data) {
            const finalPrompt = response.data.finalPrompt;
            console.log("Final Prompt : " + finalPrompt);

            // TODO : api call to gpt and get questions

            // Send question data to covert it in url
            const url = generateUrl(currentFormId, questions);
            console.log("Url : " + url);
        }
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

function insertAutoCheckButton() {
    if (document.getElementById('autoCheckButton')) {
        console.log('Auto Check Button already exists.');
        return; // If the button already exists, do nothing
    }

    const targetDiv = document.querySelector('.P2pQDc'); // Select the target element
    console.log("target", targetDiv);
    if (targetDiv) {
        // Create the button element
        const button = document.createElement('button');
        button.type = 'button';
        button.id = 'autoCheckButton';
        button.innerText = 'Auto Check Theory Questions';
        button.style.cssText = 'cursor: pointer; padding: 10px; color: white; background-color: #7860bf; border: none;';
        // Insert the button as the second child
        targetDiv.insertBefore(button, targetDiv.children[1]);
    }
    // Find the button and add a click event listener
    const autoCheckButton = document.getElementById('autoCheckButton');
    if (autoCheckButton) {
        autoCheckButton.addEventListener('click', function () {
            handleAutoCheckButtonClick();
        });
    }
}

function handleAutoCheckButtonClick() {
    // Create a container for the URL input and instructions
    const urlContainer = document.createElement('div');
    urlContainer.id = 'copyDataContainer';
    urlContainer.style.cssText = 'margin-top: 10px;';

    // Add instruction text
    const instructionText = document.createElement('p');
    instructionText.innerText = 'Copy and paste this URL in a new tab, then copy the data. After copying, click the "I Have Copied the Data" button below.';
    urlContainer.appendChild(instructionText);

    // Create an input field for the URL
    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.value = `https://script.google.com/a/macros/kiit.ac.in/s/AKfycbxwHrR53Fib2GGFCxXax44GxgOjRStYwWROZhCLRm-DoMRF7eqIQ_-uJLaJ588aKnjw/exec?sheetId=${currentSheetId}`;
    urlInput.readOnly = true;
    urlInput.style.cssText = 'width: 80%;';
    urlContainer.appendChild(urlInput);

    // Create a button for confirming after copying
    const confirmButton = document.createElement('button');
    confirmButton.innerText = 'I Have Copied the Data';
    confirmButton.style.cssText = 'margin-top: 10px; padding: 10px;';
    confirmButton.onclick = () => {
        showPasteDataArea(); // Show the paste data area
    };
    urlContainer.appendChild(confirmButton);

    // Append the container to the document
    const targetDiv = document.querySelector('.P2pQDc');
    if (targetDiv) {
        targetDiv.appendChild(urlContainer);
    }

    // Automatically select the URL text
    urlInput.focus();
    urlInput.select();
}

function showPasteDataArea() {
    // Select or create the container for pasting data
    let pasteContainer = document.getElementById('pasteDataContainer');
    if (!pasteContainer) {
        pasteContainer = document.createElement('div');
        pasteContainer.id = 'pasteDataContainer';
        const targetDiv = document.querySelector('.P2pQDc');
        if (targetDiv) {
            targetDiv.appendChild(pasteContainer);
        }
    }

    // Clear previous contents (if any)
    pasteContainer.innerHTML = '';

    // Create the textarea for pasting data
    const dataInput = document.createElement('textarea');
    dataInput.id = 'pastedDataInput';
    dataInput.placeholder = 'Paste your data here';
    dataInput.style.cssText = 'width: 100%; height: 100px; margin-top: 10px;';

    // Create the button for submitting the pasted data
    const submitButton = document.createElement('button');
    submitButton.id = 'submitPastedDataButton';
    submitButton.innerText = 'Submit Pasted Data';
    submitButton.style.cssText = 'margin-top: 10px; padding: 10px;';
    submitButton.onclick = submitPastedData;

    // Append the textarea and button to the pasteContainer
    pasteContainer.appendChild(dataInput);
    pasteContainer.appendChild(submitButton);

    // Ensure the container is visible
    pasteContainer.style.display = 'block';
}

async function submitPastedData() {
    const pastedData = document.getElementById('pastedDataInput').value;

    console.log('submitPastedData', pastedData);
    if (!pastedData) {
        alert("Please paste the data");
        return;
    }
    chrome.runtime.sendMessage({ action: "submitData", data: pastedData }, function (response) {
        console.log('Response from background:', response);

        const encodedData = encodeURIComponent(JSON.stringify(response.data));

        const endpoint = 'https://script.google.com/a/macros/kiit.ac.in/s/AKfycbwRg07RjU858bjirv4r6Jht9txCaQ3j5SnpSlIiEWD9QrRTN10rYHZ3L5MY9n84N1HT/exec';

        const url = `${endpoint}?spreadsheetId=${currentSheetId}&jsonData=${encodedData}`;

        console.log(url);
        displayURLContainer(url);

        removeDataContainers();
    });
}

function displayURLContainer(url) {
    const targetDiv = document.querySelector('.P2pQDc');
    if (targetDiv) {
        // Create a container for the button
        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'urlButtonContainer';
        buttonContainer.style.cssText = 'margin-top: 10px;';

        // Add a button
        const openUrlButton = document.createElement('button');
        openUrlButton.innerText = 'Click Here to update marks';
        openUrlButton.style.cssText = 'padding: 10px; cursor: pointer;';

        // Append the button to the container
        buttonContainer.appendChild(openUrlButton);

        // Insert the container into the page
        targetDiv.appendChild(buttonContainer);

        // Add event listener to the button to open the URL in a new tab and then remove the button
        openUrlButton.addEventListener('click', () => {
            window.open(url, '_blank');

            // Remove the button container from the UI
            buttonContainer.remove();
        });
    }
}


function removeDataContainers() {
    const urlContainer = document.getElementById('pasteDataContainer');
    if (urlContainer && urlContainer.parentNode) {
        urlContainer.parentNode.removeChild(urlContainer);
    }
    const copyData = document.getElementById('copyDataContainer');
    if (copyData && copyData.parentNode) {
        copyData.parentNode.removeChild(copyData);
    }
}

// async function fetchYourApiForSheetId() {
//     try {
//         console.log("current form id", currentFormId);
//         const yourApiUrl = `https://script.google.com/a/macros/kiit.ac.in/s/AKfycbzAdNOpxWLSzMDoSJBiGUWW-ZXdNV701y_Vmzp1oma2Ib7TILH6MeuzTvvG6-tRb1w5cQ/exec?formId=${currentFormId}`;
//         const response = await fetch(yourApiUrl);
//         const data = await response.json();
//         console.log("helooooooooo", data);
//         return data.sheetId; // Assuming the API returns the sheet ID
//     } catch (error) {
//         console.error('Error fetching sheet ID:', error);
//         throw error; // Re-throw the error to be handled by the caller
//     }
// }

