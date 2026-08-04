// LarpBlox - UI Update Logic

function updateRobuxElements() {
    try {
        const isTransactionsPage = window.location.href.includes('/transactions');
        const navSelectors = [
            '#nav-robux-amount',
            '.rbx-menu-item-label #nav-robux-amount',
            '#nav-robux-amount span'
        ];
        const fullSelectors = [
            '.robux-balance',
            '.amount.icon-robux-container',
            '.balance-label',
            '[data-testid="robux-amount"]',
            '.robux-text'
        ];

        const formattedFull = formatAmount(state.fakeRobux, false);
        const formattedAbbr = formatAmount(state.fakeRobux, true);

        // Update Nav Amounts (Abbreviated)
        navSelectors.forEach(selector => {
            try {
                document.querySelectorAll(selector).forEach(el => {
                    if (el.textContent.trim() !== formattedAbbr) el.textContent = formattedAbbr;
                });
            } catch (e) { }
        });

        if (isTransactionsPage) return;

        fullSelectors.forEach(selector => {
            try {
                document.querySelectorAll(selector).forEach(el => {
                    if (el.closest('.vlist-row') || el.closest('tr') || el.closest('.table-body') || el.closest('.item-card') || el.closest('.item-card-container')) return;
                    if (el.textContent.trim() !== formattedFull) {
                        el.textContent = formattedFull;
                    }
                });
            } catch (e) { }
        });

    } catch (e) {
        console.warn('[LarpBlox] updateRobuxElements error:', e);
    }
}

let updateTimeout;
function throttledUpdate() {
    if (updateTimeout) return;
    updateTimeout = setTimeout(() => {
        updateRobuxElements();
        handleBuyButton();
        if (window.location.href.includes('/my/avatar')) {
            handleInventoryInjection();
        }
        updateTimeout = null;
    }, 500);
}
