chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url && tab.url.includes('https://docs.google.com/forms/d/') && tab.url.includes('/edit#responses')) {
        chrome.tabs.sendMessage(tabId, { action: "insertAutoCheckButton" });
    }
    if (tab.url && tab.url.includes("docs.google.com/forms")) {

        let queryParameter = "";
        console.log("Tab URL: " + tab.url);
        const match = /\/d\/([a-zA-Z0-9-_]+)\//.exec(tab.url);
        if (match && match[1]) {
            queryParameter = match[1];
            console.log("Unique ID: " + queryParameter);
        }

        const urlParameters = new URLSearchParams(queryParameter);

        chrome.tabs.sendMessage(tabId, {
            type: "NEW",
            formId: queryParameter
        });
    }
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const apiURL = 'https://prompt-enhancer.onrender.com/api/v1/suffix/promptAdd/';

    (async () => {
        try {
            const response = await fetch(apiURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: request.userPrompt })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            sendResponse({ data: data });
        } catch (error) {
            console.error('Error:', error);
            sendResponse({ error: error.message });
        }
    })();

    return true; // Return true to indicate you wish to send a response asynchronously
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "submitData") {
        fetch('http://localhost:5000/api/v1/formatter/extract-answers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: request.data
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                sendResponse({ data: data });
            })
            .catch(error => {
                sendResponse({ error: error.message });
            });

        return true; // Indicates that the response is sent asynchronously
    }
});
