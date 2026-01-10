// popup.js
document.addEventListener('DOMContentLoaded', () => {
    const hideReviewsCheckbox = document.getElementById('hideReviewsWithoutImages');
    const bwModeCheckbox = document.getElementById('blackAndWhiteMode');
    const autoRedirectsCheckbox = document.getElementById('autoRedirects');
    const autoSelectVariantReviewsCheckbox = document.getElementById('autoSelectVariantReviews'); // New checkbox

    // Load saved settings and update checkboxes
    chrome.storage.sync.get(
        ['hideReviewsWithoutImages', 'blackAndWhiteMode', 'autoRedirects', 'autoSelectVariantReviews'],
        (settings) => {
            if (settings.hideReviewsWithoutImages) {
                hideReviewsCheckbox.checked = true;
            }
            if (settings.blackAndWhiteMode) {
                bwModeCheckbox.checked = true;
            }
            if (settings.autoRedirects) {
                autoRedirectsCheckbox.checked = true;
            }
            if (settings.autoSelectVariantReviews) { // Load new setting
                autoSelectVariantReviewsCheckbox.checked = true;
            }
        }
    );

    // Save settings when checkboxes change
    hideReviewsCheckbox.addEventListener('change', (event) => {
        chrome.storage.sync.set({ hideReviewsWithoutImages: event.target.checked }, () => {
            notifyContentScriptOfSettingsChange();
        });
    });

    bwModeCheckbox.addEventListener('change', (event) => {
        chrome.storage.sync.set({ blackAndWhiteMode: event.target.checked }, () => {
            notifyContentScriptOfSettingsChange();
        });
    });

    autoRedirectsCheckbox.addEventListener('change', (event) => {
        chrome.storage.sync.set({ autoRedirects: event.target.checked }, () => {
            notifyContentScriptOfSettingsChange();
        });
    });

    autoSelectVariantReviewsCheckbox.addEventListener('change', (event) => { // Save new setting
        chrome.storage.sync.set({ autoSelectVariantReviews: event.target.checked }, () => {
            notifyContentScriptOfSettingsChange();
        });
    });
});

function notifyContentScriptOfSettingsChange() {
    chrome.tabs.query({ active: true, currentWindow: true, url: "https://www.ozon.ru/*" }, (tabs) => {
        if (tabs.length > 0 && tabs[0].id) {
            chrome.tabs.sendMessage(tabs[0].id, { type: "OZON_SETTINGS_UPDATED" }, (response) => {
                if (chrome.runtime.lastError) {
                    // console.warn("Error sending message to content script:", chrome.runtime.lastError.message);
                }
                // If redirects were just enabled, the page might reload/redirect due to settings.js
                // No need to explicitly reload from popup.js for redirects.
            });
        }
    });
}