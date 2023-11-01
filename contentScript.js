// This function fetches and returns the content of temp.html
function fetchTempHtml() {
    return fetch(chrome.runtime.getURL('temp.html')).then(response => response.text());
}

// This function injects HTML content into the page
function injectHtml(html) {
    const targetDivs = document.getElementsByClassName('q5O05c oydeSd');
    if (targetDivs.length > 0) {
        // Since getElementsByClassName returns a collection, we access the first element
        const targetDiv = targetDivs[0];
        const container = document.createElement('div');
        container.innerHTML = html;
        // Insert the container after the target div
        targetDiv.parentNode.insertBefore(container, targetDiv.nextSibling);
    }
}

// When the DOM is fully loaded, fetch temp.html and inject it
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        fetchTempHtml().then(html => injectHtml(html));
    });
} else {
    // This means the DOM is already loaded
    fetchTempHtml().then(html => injectHtml(html));
}
