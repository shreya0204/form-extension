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
            formId: urlParameters
        });
    }
});


// background.js
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.data) {
            // Handle the data received from the content script here
            console.log(request.data);
        }
    }
);
