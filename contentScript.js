let currentFormId = null; // This variable will hold the form ID
// let currentSheetId = '1ROzHfRXbtNW4n-oDd05o0RmDvEcup3rAxiKcxrtER80'; // This variable will hold the
let currentSheetId = localStorage.getItem('spreadsheetId');

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'insertAutoCheckButton') {
        insertAutoCheckButton();
    }
    if (message.type === 'NEW') {
        currentFormId = message.formId; // Store the form ID
        console.log('Form ID received:', currentFormId);
    }
});

// This function fetches and returns the content of prompt.html
function fetchPromptHtml() {
    return fetch(chrome.runtime.getURL('prompt.html')).then((response) =>
        response.text(),
    );
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

function resetSearchButton() {
    const searchButton = document.getElementById('searchButton');
    const addQuestionsButton = document.getElementById('addQuestionsButton');

    searchButton.style.display = 'inline-block';
    addQuestionsButton.style.display = 'none';

    searchButton.innerText = 'Search your result';
    searchButton.disabled = false;
    searchButton.style.backgroundColor = '#7860bf';
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

function generateUrl(formId, questions) {
    const scriptUrl =
        'https://script.google.com/a/macros/kiit.ac.in/s/AKfycbzmUChMVYOzNTRwUb1M802iYeYZKZGR4O7iFocYqJBlr_aTTgzTvxemGcNvuAOjm-0/exec';
    var encodedQuestions = encodeURIComponent(JSON.stringify(questions));
    var fullUrl =
        scriptUrl + '?formId=' + formId + '&questionData=' + encodedQuestions;

    showAddQuestionsButton(fullUrl);
    return fullUrl;
}

function showAddQuestionsButton(url) {
    const searchButton = document.getElementById('searchButton');
    const addQuestionsButton = document.getElementById('addQuestionsButton');

    searchButton.style.display = 'none';
    addQuestionsButton.style.display = 'inline-block';

    addQuestionsButton.onclick = function () {
        window.open(url, '_blank');
        resetSearchButton();
    };
}

// Sets up the click event listener for the "Search your result" button
function setUpButtonListener() {
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
        searchButton.addEventListener('click', function () {
            const userInput = document.getElementById('prompt').value;
            const promptTypeSelect =
                document.getElementById('promptTypeSelect');
            const promptType =
                promptTypeSelect.options[promptTypeSelect.selectedIndex].value;
            handleSearch(userInput, promptType);
        });
    }
}

function showSpreadsheetIdInput() {
    const targetDiv = document.querySelector('.P2pQDc');
    if (!targetDiv) return;

    // Textarea for input
    const textarea = document.createElement('textarea');
    textarea.id = 'spreadsheetIdInput';
    textarea.style.cssText = 'width: 100%; height: 50px; margin-top: 10px;';
    textarea.placeholder = 'Enter your linked spreadsheet ID here';

    // Submit button
    const submitButton = document.createElement('button');
    submitButton.innerText = 'Submit';
    submitButton.style.cssText =
        'margin-top: 10px; padding: 10px 30px; color:white ; background-color: #7860bf; border: none;';
    submitButton.addEventListener('click', function () {
        const enteredId = textarea.value.trim();
        if (enteredId) {
            localStorage.setItem('spreadsheetId', enteredId); // Store the ID
            currentSheetId = enteredId;
            insertAutoCheckButton();
            textarea.remove();
            submitButton.remove();
        } else {
            alert('Please enter a valid spreadsheet ID.');
        }
    });

    targetDiv.appendChild(textarea);
    targetDiv.appendChild(submitButton);
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
    chrome.runtime.sendMessage(
        { action: 'generateQuestions', userPrompt: userPrompt },
        function (response) {
            if (response.error) {
                alert('Error: ' + response.error);
                enableSearchButton();
                return;
            }
            if (response.data) {
                const questions = response.data;
                if (questions.length === 0) {
                    alert('No questions found');
                    enableSearchButton();
                    return;
                }
                console.log('Final Questions : ' + questions);
                const url = generateUrl(currentFormId, questions);
                console.log('Url : ' + url);
            }
        },
    );
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeContentScript);
} else {
    initializeContentScript();
}

function insertAutoCheckButton() {
    if (document.getElementById('autoCheckButton') || !currentSheetId) {
        return; // Do not proceed if button exists or sheet ID is missing
    }

    const targetDiv = document.querySelector('.P2pQDc'); // Select the target element
    console.log('target', targetDiv);
    if (targetDiv) {
        // Create the button element
        const button = document.createElement('button');
        button.type = 'button';
        button.id = 'autoCheckButton';
        button.innerText = 'Auto Check Theory Questions';
        button.style.cssText =
            'cursor: pointer; padding: 10px; color: white; background-color: #7860bf; border: none;';
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
function initializeContentScript() {
    if (currentSheetId) {
        insertAutoCheckButton(); // Show button if ID is known
    } else {
        showSpreadsheetIdInput(); // Show input if ID is not known
    }
    fetchPromptHtml().then((html) => injectHtml(html));
}

function handleAutoCheckButtonClick() {
    // Create a container for the URL input and instructions
    const urlContainer = document.createElement('div');
    urlContainer.id = 'copyDataContainer';
    urlContainer.style.cssText = 'margin-top: 10px;';

    // Add instruction text
    const instructionText = document.createElement('p');
    instructionText.innerText =
        'Copy and paste this URL in a new tab, then copy the data. After copying, click the "I Have Copied the Data" button below.';
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
    if (!pastedData) {
        alert('Please paste the data');
        return;
    }

    displayLoadingScreen(true);
    removeDataContainers();

    try {
        chrome.runtime.sendMessage(
            { action: 'submitData', data: pastedData },
            function (response) {
                if (response.error) {
                    alert('Error: ' + response.error);
                    enableSearchButton();
                    return;
                }
                if (response.data) {
                    console.log('Response Data', response.data);
                    const encodedData = encodeURIComponent(response.data);
                    const marksUrl =
                        'https://script.google.com/a/macros/kiit.ac.in/s/AKfycbwRg07RjU858bjirv4r6Jht9txCaQ3j5SnpSlIiEWD9QrRTN10rYHZ3L5MY9n84N1HT/exec' +
                        '?spreadsheetId=' +
                        currentSheetId +
                        '&jsonData=' +
                        encodedData;
                    displayLoadingScreen(false);
                    displayURLContainer(marksUrl);
                }
            },
        );
    } catch (error) {
        displayLoadingScreen(false);
        alert('Error: ' + error);
    }
}


function displayLoadingScreen(show) {
    if (!show) {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.remove();
        }
        return;
    }

    const targetDiv = document.querySelector('.P2pQDc');
    if (targetDiv) {
        // Create a container for the loading indicator
        const loadingContainer = document.createElement('div');
        loadingContainer.id = 'loadingScreen';
        loadingContainer.style.cssText = 'width:100%; margin-top: 10px;';

        // Create a disabled button to act as a loading indicator
        const loadingButton = document.createElement('button');
        loadingButton.innerText = 'Loading...';
        loadingButton.style.cssText = 'width:100%; padding: 10px; cursor: not-allowed; background-color: #f3f3f3; color: #999;';
        loadingButton.disabled = true; // Disable the button to prevent clicks

        // Append the button to the container
        loadingContainer.appendChild(loadingButton);

        // Insert the container into the page
        targetDiv.appendChild(loadingContainer);
    }
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

