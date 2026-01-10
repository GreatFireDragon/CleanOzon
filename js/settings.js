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

function applyAutoRedirects(enabled) {
    if (!enabled) {
        return false;
    }

    const redirectPaths = ["/", "/category/"];
    const targetRedirectUrl = "https://www.ozon.ru/my/orderlist/";
    const currentPathname = window.location.pathname;
    const currentFullUrl = window.location.href;

    if (redirectPaths.includes(currentPathname)) {
        if (currentFullUrl !== targetRedirectUrl && !currentPathname.startsWith('/my/orderlist')) {
            window.location.replace(targetRedirectUrl);
            return true;
        }
    }
    return false;
}

function applyAutoSelectVariantReviews(enabled) {
    if (!enabled) {
        return false;
    }

    if (!window.location.pathname.startsWith('/product/')) {
        return false;
    }

    const currentUrl = new URL(window.location.href);
    const params = currentUrl.searchParams;

    if (params.get('reviewsVariantMode') === '0') {
        return false;
    }

    if (params.get('reviewsVariantMode') === '1') {
        return false;
    }

    params.set('reviewsVariantMode', '1');
    currentUrl.search = params.toString();
    window.location.replace(currentUrl.toString());
    return true;
}

// --- Load and Apply All Settings ---
function loadAndApplyAllSettings() {
    chrome.storage.sync.get(
        ['hideReviewsWithoutImages', 'blackAndWhiteMode', 'autoRedirects', 'autoSelectVariantReviews'],
        (settings) => {
            if (applyAutoRedirects(settings.autoRedirects === true)) {
                return;
            }

            if (applyAutoSelectVariantReviews(settings.autoSelectVariantReviews === true)) {
                return;
            }

            applyBlackAndWhiteMode(settings.blackAndWhiteMode === true);
            applyHideReviewsWithoutImages(settings.hideReviewsWithoutImages === true);
        }
    );
}

// --- Initial Load & Message Listener ---
loadAndApplyAllSettings();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "OZON_SETTINGS_UPDATED") {
        loadAndApplyAllSettings();
        sendResponse({ status: "Settings re-applied on page" });
        return true;
    }
});
