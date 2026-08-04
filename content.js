// LarpBlox - Main Entry Script

// Load state and initialize features
chrome.storage.local.get(['fakeRobux', 'setFakeRobux', 'inventory', 'history', 'equipped', 'larpId', 'larpBodyColors'], (result) => {

    // 1. Sync local state
    if (result.fakeRobux !== undefined) state.fakeRobux = result.fakeRobux;
    if (result.setFakeRobux !== undefined) state.setFakeRobux = result.setFakeRobux;
    else state.setFakeRobux = state.fakeRobux; // fallback for older saves
    if (result.inventory !== undefined) state.inventory = result.inventory;
    if (result.history !== undefined) state.history = result.history;
    if (result.equipped !== undefined) state.equipped = result.equipped;
    if (result.larpId !== undefined) state.larpId = result.larpId;
    if (result.larpBodyColors !== undefined) window._larpCustomBodyColors = result.larpBodyColors;

    // 2. Immediate Styles & Hooks
    applyGlobalStyles();
    injectDeepHook();

    // 3. Main Update Logic
    const fullRefresh = () => {
        updateRobuxElements();
        handleBuyButton();
        handleOwnedStatus();
        handleAvatarLarping();
        handleInventoryInjection();
    };

    // Run once immediately
    fullRefresh();

    // 4. Heartbeat for SPA/Dynamic content
    setInterval(fullRefresh, 600);

    // 5. Mutation Observer for rapid updates
    const observer = new MutationObserver((mutations) => {
        const hasAdditions = mutations.some(m => m.addedNodes.length > 0);
        if (hasAdditions) {
            updateRobuxElements();
            handleBuyButton();
            handleOwnedStatus();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
});

// Define critical setup functions
function injectDeepHook() {
    if (document.getElementById('larp-deep-hook')) return;
    const script = document.createElement('script');
    script.id = 'larp-deep-hook';
    script.src = chrome.runtime.getURL('hook.js');
    (document.head || document.documentElement).appendChild(script);
}

// Storage Listener
chrome.storage.onChanged.addListener((changes) => {
    chrome.storage.local.get(['larpId'], (res) => { // dummy get just to maintain structure or just remove check
        if (changes.fakeRobux) state.fakeRobux = changes.fakeRobux.newValue;
        if (changes.inventory) state.inventory = changes.inventory.newValue;
        if (changes.history) state.history = changes.history.newValue;
        if (changes.uiMode) state.uiMode = changes.uiMode.newValue;
        if (changes.equipped) state.equipped = changes.equipped.newValue;
        if (changes.larpId) state.larpId = changes.larpId.newValue;
        if (changes.larpBodyColors) window._larpCustomBodyColors = changes.larpBodyColors.newValue;
        updateRobuxElements();
        handleAvatarLarping();
    });
});

// Message Listener for skin tones
window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'LARP_BODY_COLORS_UPDATED') {
        console.log('[LarpBlox] Received skin tone update message:', JSON.stringify(event.data.colors));

        if (!event.data.colors) {
            console.warn('[LarpBlox] Ignored null color update');
            return;
        }

        window._larpCustomBodyColors = event.data.colors;
        chrome.storage.local.set({ larpBodyColors: event.data.colors });

        // Wipe all caches to force a fresh render with the new colors
        if (typeof window.clearRenderCache === 'function') {
            console.log('[LarpBlox] Wiping render cache for new colors');
            window.clearRenderCache();
        }
        if (typeof window.clearAvatarBaseCache === 'function') {
            console.log('[LarpBlox] Wiping base avatar cache for new colors');
            window.clearAvatarBaseCache();
        }

        window._larpComboKey = null; // force re-render
        window._larpRenderCache = null; // clear previous image

        console.log('[LarpBlox] Colors globally set, triggering re-render...');
        handleAvatarLarping();
    }
});
