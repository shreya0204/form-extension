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
        "title": "Explain the theory of relativity.",
        "required": true,
        "points": 5
    },
    {
        "type": "text",
        "title": "Describe the process of photosynthesis.",
        "required": true,
        "points": 5
    },
    {
        "type": "text",
        "title": "Summarize the main events of the French Revolution.",
        "required": true,
        "points": 5
    }
]

let currentFormId = null; // This variable will hold the form ID

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type === "NEW") {
        currentFormId = message.formId; // Store the form ID
        console.log('Form ID received:', currentFormId);
    }
});

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
