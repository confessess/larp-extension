chrome.storage.local.get(['fakeRobux', 'setFakeRobux', 'inventory', 'history', 'equipped', 'larpId', 'larpBodyColors', 'transactions'], (result) => {
    if (result.fakeRobux !== undefined) state.fakeRobux = result.fakeRobux;
    if (result.setFakeRobux !== undefined) state.setFakeRobux = result.setFakeRobux;
    else state.setFakeRobux = state.fakeRobux;
    if (result.inventory !== undefined) state.inventory = result.inventory;
    if (result.history !== undefined) state.history = result.history;
    if (result.transactions !== undefined) state.transactions = result.transactions;
    if (result.equipped !== undefined) state.equipped = result.equipped;
    if (result.larpId !== undefined) state.larpId = result.larpId;
    if (result.larpBodyColors !== undefined) window._larpCustomBodyColors = result.larpBodyColors;

    applyGlobalStyles();
    injectDeepHook();

    const fullRefresh = () => {
        updateRobuxElements();
        handleBuyButton();
        handleOwnedStatus();
        handleAvatarLarping();
        handleInventoryInjection();
    };

    fullRefresh();

    setInterval(fullRefresh, 600);

    const observer = new MutationObserver((mutations) => {
        const hasAdditions = mutations.some(m => m.addedNodes.length > 0);
        if (hasAdditions) {
            updateRobuxElements();
            handleBuyButton();
            handleOwnedStatus();
            handleInventoryInjection();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
});

function injectDeepHook() {
    if (document.getElementById('larp-deep-hook')) return;
    const script = document.createElement('script');
    script.id = 'larp-deep-hook';
    script.src = chrome.runtime.getURL('hook.js');
    (document.head || document.documentElement).appendChild(script);
}

chrome.storage.onChanged.addListener((changes) => {
    chrome.storage.local.get(['larpId'], (res) => {
        if (changes.fakeRobux) state.fakeRobux = changes.fakeRobux.newValue;
        if (changes.inventory) state.inventory = changes.inventory.newValue;
        if (changes.history) state.history = changes.history.newValue;
        if (changes.transactions) state.transactions = changes.transactions.newValue;
        if (changes.uiMode) state.uiMode = changes.uiMode.newValue;
        if (changes.equipped) state.equipped = changes.equipped.newValue;
        if (changes.larpId) state.larpId = changes.larpId.newValue;
        if (changes.larpBodyColors) window._larpCustomBodyColors = changes.larpBodyColors.newValue;
        updateRobuxElements();
        handleAvatarLarping();
    });
});

window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'LARP_BODY_COLORS_UPDATED') {
        console.log('[LarpBlox] Received skin tone update message:', JSON.stringify(event.data.colors));
        if (!event.data.colors) {
            console.warn('[LarpBlox] Ignored null color update');
            return;
        }
        window._larpCustomBodyColors = event.data.colors;
        chrome.storage.local.set({ larpBodyColors: event.data.colors });
        if (typeof window.clearRenderCache === 'function') {
            console.log('[LarpBlox] Wiping render cache for new colors');
            window.clearRenderCache();
        }
        if (typeof window.clearAvatarBaseCache === 'function') {
            console.log('[LarpBlox] Wiping base avatar cache for new colors');
            window.clearAvatarBaseCache();
        }
        window._larpComboKey = null;
        window._larpRenderCache = null;
        console.log('[LarpBlox] Colors globally set, triggering re-render...');
        handleAvatarLarping();
    }
});