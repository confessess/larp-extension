// LarpBlox - Utility Functions

// Helper to format Robux amounts (abbreviated for nav, full for details)
function formatAmount(n, abbreviate) {
    if (!abbreviate || n < 10000) return n.toLocaleString();
    if (n >= 1000000000) return Math.floor(n / 1000000000) + 'B+';
    if (n >= 1000000) return Math.floor(n / 1000000) + 'M+';
    if (n >= 1000) return Math.floor(n / 1000) + 'K+';
    return n.toLocaleString();
}

// Helper: Get the asset thumbnail from Roblox API (guaranteed correct image)
async function getAssetThumbnail() {
    const urlMatch = window.location.href.match(/\/(catalog|bundles)\/(\d+)/);
    if (!urlMatch) return "";

    const assetId = urlMatch[2];
    const isBundle = urlMatch[1] === 'bundles';

    try {
        const apiUrl = isBundle
            ? `https://thumbnails.roblox.com/v1/bundles/thumbnails?bundleIds=${assetId}&size=420x420&format=Png&isCircular=false`
            : `https://thumbnails.roblox.com/v1/assets?assetIds=${assetId}&returnPolicy=PlaceHolder&size=420x420&format=Png&isCircular=false`;
        const resp = await fetch(apiUrl);
        const data = await resp.json();
        if (data.data && data.data[0] && data.data[0].imageUrl) {
            return data.data[0].imageUrl;
        }
    } catch (err) {
        console.log('[LarpBlox] Thumbnail API error:', err);
    }
    return "";
}

// Get the asset ID from the current catalog/bundle URL
function getAssetIdFromUrl() {
    const match = window.location.href.match(/\/(catalog|bundles)\/(\d+)/);
    return match ? match[2] : null;
}

// Detect if the current item is Limited or Limited U
async function detectLimitedStatus() {
    const limitedBadge = document.querySelector(
        '.limited-icon, [data-testid="limited-icon"], .icon-limited-unique, .icon-limited, ' +
        '.item-restriction-icon .icon-limited-unique-label, .item-restriction-icon .icon-limited-label'
    );
    if (limitedBadge) {
        const text = limitedBadge.className || limitedBadge.textContent || '';
        if (text.includes('unique') || text.includes('Unique')) return 'limited_u';
        return 'limited';
    }

    const allLabels = document.querySelectorAll('.item-restriction-icon span, .asset-restriction-icon span, [class*="limited"]');
    for (const label of allLabels) {
        const t = label.textContent.trim().toLowerCase();
        if (t.includes('limited u') || t.includes('limited unique')) return 'limited_u';
        if (t === 'limited') return 'limited';
    }

    const assetId = getAssetIdFromUrl();
    if (assetId) {
        try {
            const resp = await fetch(`https://economy.roblox.com/v2/assets/${assetId}/details`, { credentials: 'include' });
            if (resp.ok) {
                const data = await resp.json();
                if (data.IsLimitedUnique) return 'limited_u';
                if (data.IsLimited) return 'limited';
            }
        } catch (e) {
            console.log('[LarpBlox] Economy API error:', e);
        }
    }

    return null;
}
