document.addEventListener('DOMContentLoaded', () => {
    const robuxInput = document.getElementById('robux-amount');
    const saveBtn = document.getElementById('save-btn');
    const resetBtn = document.getElementById('reset-btn');
    const status = document.getElementById('status');
    const addItemIdInput = document.getElementById('manual-item-id');
    const addItemBtn = document.getElementById('add-item-btn');

    const uiModeSelect = document.getElementById('ui-mode');

    // Load current state
    chrome.storage.local.get(['fakeRobux', 'larpId', 'uiMode'], (result) => {
        if (result.fakeRobux !== undefined) {
            robuxInput.value = result.fakeRobux;
        }
        if (uiModeSelect) {
            uiModeSelect.value = (result.uiMode && ['auto', 'light', 'dark'].includes(result.uiMode)) ? result.uiMode : 'auto';
        }
    });

    saveBtn.addEventListener('click', () => {
        const amount = parseInt(robuxInput.value);
        const uiModeValue = (uiModeSelect && uiModeSelect.value) ? uiModeSelect.value : 'auto';

        if (isNaN(amount) && amount !== undefined) return;

        chrome.storage.local.set({
            fakeRobux: amount,
            setFakeRobux: amount,
            uiMode: uiModeValue
        }, () => {
            showStatus('Changes Saved!');
        });
    });

    addItemBtn.addEventListener('click', async () => {
        const assetId = addItemIdInput.value.trim();
        if (!assetId) return;

        showStatus('Adding...');
        addItemBtn.disabled = true;

        try {
            // First try as normal asset
            let detailRes = await fetch(`https://economy.roblox.com/v2/assets/${assetId}/details`);

            // If it fails, try as a bundle
            if (!detailRes.ok) {
                const bundleRes = await fetch(`https://catalog.roblox.com/v1/bundles/${assetId}/details`);
                if (bundleRes.ok) {
                    showStatus('Adding Bundle...');
                    const bundleData = await bundleRes.json();
                    if (bundleData.items && bundleData.items.length > 0) {
                        const assets = bundleData.items.filter(item => item.type === "Asset");
                        if (assets.length > 0) {
                            const assetIdsStr = assets.map(a => a.id).join(',');
                            const thumbRes = await fetch(`https://thumbnails.roblox.com/v1/assets?assetIds=${assetIdsStr}&returnPolicy=PlaceHolder&size=420x420&format=Png&isCircular=false`);
                            let thumbsMap = {};
                            if (thumbRes.ok) {
                                const thumbData = await thumbRes.json();
                                (thumbData.data || []).forEach(t => { thumbsMap[t.targetId] = t.imageUrl; });
                            }

                            chrome.storage.local.get(['inventory'], (result) => {
                                const inventory = result.inventory || [];
                                for (const item of assets) {
                                    inventory.push({
                                        name: item.name,
                                        image: thumbsMap[item.id] || "",
                                        creator: bundleData.creator?.name || "Roblox",
                                        date: new Date().toISOString(),
                                        id: Math.random().toString(36).substr(2, 9),
                                        assetId: item.id.toString(),
                                        limitedStatus: null
                                    });
                                }
                                chrome.storage.local.set({ inventory }, () => {
                                    addItemIdInput.value = '';
                                    showStatus('Bundle Added!');
                                    addItemBtn.disabled = false;
                                });
                            });
                            return; // Stop here for bundles
                        }
                    }
                }
                throw new Error('Invalid Asset or Bundle ID');
            }

            const data = await detailRes.json();

            // Fetch thumbnail
            const thumbRes = await fetch(`https://thumbnails.roblox.com/v1/assets?assetIds=${assetId}&returnPolicy=PlaceHolder&size=420x420&format=Png&isCircular=false`);
            let imageUrl = '';
            if (thumbRes.ok) {
                const thumbData = await thumbRes.json();
                imageUrl = thumbData.data?.[0]?.imageUrl || '';
            }

            // Detect limited status
            let limitedStatus = null;
            if (data.IsLimitedUnique) limitedStatus = 'limited_u';
            else if (data.IsLimited) limitedStatus = 'limited';

            // Save to storage
            chrome.storage.local.get(['inventory'], (result) => {
                const inventory = result.inventory || [];
                inventory.push({
                    name: data.Name || data.name || "Roblox Item",
                    image: imageUrl,
                    creator: data.Creator?.Name || "Roblox",
                    date: new Date().toISOString(),
                    id: Math.random().toString(36).substr(2, 9),
                    assetId: assetId,
                    limitedStatus: limitedStatus
                });
                chrome.storage.local.set({ inventory }, () => {
                    addItemIdInput.value = '';
                    showStatus('Item Added!');
                    addItemBtn.disabled = false;
                });
            });

        } catch (e) {
            showStatus('Failed API Check');
            console.error(e);
            addItemBtn.disabled = false;
        }
    });

    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all simulated data?')) {
            chrome.storage.local.remove(['fakeRobux', 'inventory', 'history', 'equipped'], () => {
                robuxInput.value = 10000000;
                showStatus('Reset Complete');
            });
        }
    });


    function showStatus(text) {
        const originalText = status.textContent;
        status.textContent = text;
        setTimeout(() => {
            status.textContent = originalText;
        }, 2000);
    }
});
