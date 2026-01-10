// js/settings.js

const OZON_BW_MODE_CLASS = 'ozon-customizer-bw-mode';
const OZON_HIDE_REVIEWS_NO_IMG_CLASS = 'ozon-customizer-hide-reviews-no-img';

// --- Settings Application Functions ---

function applyBlackAndWhiteMode(enabled) {
    if (enabled) {
        document.documentElement.classList.add(OZON_BW_MODE_CLASS);
    } else {
        document.documentElement.classList.remove(OZON_BW_MODE_CLASS);
    }
}

function applyHideReviewsWithoutImages(enabled) {
    if (enabled && window.location.pathname.startsWith('/product/')) {
        document.documentElement.classList.add(OZON_HIDE_REVIEWS_NO_IMG_CLASS);
    } else {
        document.documentElement.classList.remove(OZON_HIDE_REVIEWS_NO_IMG_CLASS);
    }
}

/**
 * Applies auto-redirects from specified paths to the order list.
 * @param {boolean} enabled - Whether the setting is enabled.
 * @returns {boolean} - True if a redirect was initiated, false otherwise.
 */
function applyAutoRedirects(enabled) {
    if (!enabled) {
        return false;
    }

    const redirectPaths = ["/", "/category/"]; // Pages to redirect from
    const targetRedirectUrl = "https://www.ozon.ru/my/orderlist/";
    const currentPathname = window.location.pathname;
    const currentFullUrl = window.location.href;

    if (redirectPaths.includes(currentPathname)) {
        if (currentFullUrl !== targetRedirectUrl && !currentPathname.startsWith('/my/orderlist')) {
            // console.log(`Ozon Customizer: Redirecting from ${currentPathname} to /my/orderlist/`);
            window.location.replace(targetRedirectUrl);
            return true; // Redirect initiated
        }
    }
    return false; // No redirect
}

/**
 * Automatically selects "Этот вариант товара" for reviews on product pages
 * by redirecting to a URL with ?reviewsVariantMode=1,
 * unless ?reviewsVariantMode=0 is already present.
 * @param {boolean} enabled - Whether the setting is enabled.
 * @returns {boolean} - True if a redirect was initiated, false otherwise.
 */
function applyAutoSelectVariantReviews(enabled) {
    if (!enabled) {
        return false;
    }

    // Only apply on product pages
    if (!window.location.pathname.startsWith('/product/')) {
        return false;
    }

    const currentUrl = new URL(window.location.href);
    const params = currentUrl.searchParams;

    // If user explicitly wants to see reviews for all variants (reviewsVariantMode=0), do nothing.
    if (params.get('reviewsVariantMode') === '0') {
        // console.log("Ozon Customizer: reviewsVariantMode=0 found, respecting user choice.");
        return false;
    }

    // If already set to show reviews for "this variant" (reviewsVariantMode=1), do nothing.
    if (params.get('reviewsVariantMode') === '1') {
        // console.log("Ozon Customizer: reviewsVariantMode=1 already set.");
        return false;
    }

    // Otherwise, set reviewsVariantMode=1 and redirect.
    // console.log("Ozon Customizer: Setting reviewsVariantMode=1 for product reviews.");
    params.set('reviewsVariantMode', '1');
    currentUrl.search = params.toString();
    window.location.replace(currentUrl.toString());
    return true; // Redirect initiated
}


// --- Load and Apply All Settings ---

function loadAndApplyAllSettings() {
    chrome.storage.sync.get(
        ['hideReviewsWithoutImages', 'blackAndWhiteMode', 'autoRedirects', 'autoSelectVariantReviews'],
        (settings) => {
            // Apply redirects first, as they might navigate away.
            // If a redirect function returns true, it means a redirect was initiated,
            // so we stop further processing for this page load.

            if (applyAutoRedirects(settings.autoRedirects === true)) {
                return;
            }

            if (applyAutoSelectVariantReviews(settings.autoSelectVariantReviews === true)) {
                return;
            }

            // Apply other visual settings if no redirect occurred
            applyBlackAndWhiteMode(settings.blackAndWhiteMode === true);
            applyHideReviewsWithoutImages(settings.hideReviewsWithoutImages === true);
        }
    );
}

// --- Initial Load & Message Listener ---

loadAndApplyAllSettings();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "OZON_SETTINGS_UPDATED") {
        // console.log("Ozon Customizer: Received settings update from popup.");
        loadAndApplyAllSettings();
        sendResponse({ status: "Settings re-applied on page" });
        return true;
    }
});