chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
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


