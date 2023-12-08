// auto starts the extension
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (
        tab.url &&
        tab.url.includes('https://docs.google.com/forms/d/') &&
        tab.url.includes('/edit#responses')
    ) {
        chrome.tabs.sendMessage(tabId, { action: 'insertAutoCheckButton' });
    }
    if (tab.url && tab.url.includes('docs.google.com/forms')) {
        let queryParameter = '';
        console.log('Tab URL: ' + tab.url);
        const match = /\/d\/([a-zA-Z0-9-_]+)\//.exec(tab.url);
        if (match && match[1]) {
            queryParameter = match[1];
            console.log('Unique ID: ' + queryParameter);
        }

        const urlParameters = new URLSearchParams(queryParameter);

        chrome.tabs.sendMessage(tabId, {
            type: 'NEW',
            formId: queryParameter,
        });
    }
});

// sheet data to API
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'submitData') {
        const apiURL = 'http://localhost:5000/api/v1/formatter/extract-answers';

        (async () => {
            const parsedData = JSON.parse(request.data);
            const requestbody = JSON.stringify(parsedData);
            try {
                const response = await fetch(apiURL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: requestbody,
                });
                const data = await response.json();
                console.log(data);
                sendResponse({ data: data });
            } catch (error) {
                console.error('Error:', error);
                sendResponse({ error: error.message });
            }
        })();

        return true;
    }
});

// responsible to generate questions
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const apiURL = 'http://localhost:3000/api/v1/suffix/promptAdd';
    if (request.action == 'generateQuestions') {
        (async () => {
            try {
                const response = await fetch(apiURL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ prompt: request.userPrompt }),
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log(data);
                sendResponse({ data: data });
            } catch (error) {
                console.error('Error:', error);
                sendResponse({ error: error.message });
            }
        })();
        return true; // Return true to indicate you wish to send a response asynchronously
    }
});

