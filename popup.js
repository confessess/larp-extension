document.addEventListener('DOMContentLoaded', () => {
    const robuxInput = document.getElementById('robux-amount');
    const saveBtn = document.getElementById('save-btn');
    const resetBtn = document.getElementById('reset-btn');
    const status = document.getElementById('status');
    const addItemIdInput = document.getElementById('manual-item-id');
    const addItemBtn = document.getElementById('add-item-btn');
    const displayNameInput = document.getElementById('display-name');
    const usernameInput = document.getElementById('username');
    const followerInput = document.getElementById('follower-count');

    const txList = document.getElementById('transaction-list');
    const txDesc = document.getElementById('tx-desc');
    const txType = document.getElementById('tx-type');
    const txAmount = document.getElementById('tx-amount');
    const txDate = document.getElementById('tx-date');
    const addTxBtn = document.getElementById('add-tx-btn');

    if (txDate) txDate.valueAsDate = new Date();

    function showStatus(text) {
        const originalText = status.textContent;
        status.textContent = text;
        setTimeout(() => { status.textContent = originalText; }, 2000);
    }

    function renderTransactions(transactions) {
        if (!txList) return;
        txList.innerHTML = '';
        const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
        sorted.forEach((t, i) => {
            const div = document.createElement('div');
            div.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:6px 8px;background:rgba(0,0,0,0.2);border-radius:6px;font-size:0.75rem;';
            const amountColor = t.amount >= 0 ? '#34d399' : '#ef4444';
            div.innerHTML = `
                <div style="display:flex;flex-direction:column;gap:2px;overflow:hidden;flex:1;min-width:0;">
                    <span style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${t.description}</span>
                    <span style="color:var(--text-dim);font-size:0.65rem;">${t.type} • ${new Date(t.date).toLocaleDateString()}</span>
                </div>
                <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
                    <span style="color:${amountColor};font-weight:700;">${t.amount >= 0 ? '+' : ''}${parseInt(t.amount).toLocaleString()}</span>
                    <button class="del-tx" data-idx="${i}" style="background:none;border:none;color:var(--danger);cursor:pointer;padding:2px 4px;font-size:0.9rem;line-height:1;">×</button>
                </div>
            `;
            txList.appendChild(div);
        });
        txList.querySelectorAll('.del-tx').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.idx);
                chrome.storage.local.get(['transactions'], (res) => {
                    const txs = res.transactions || [];
                    const sorted = [...txs].sort((a, b) => new Date(b.date) - new Date(a.date));
                    sorted.splice(idx, 1);
                    chrome.storage.local.set({ transactions: sorted }, () => {
                        renderTransactions(sorted);
                        showStatus('Removed');
                    });
                });
            });
        });
    }

    chrome.storage.local.get(['fakeRobux', 'larpId', 'uiMode', 'transactions', 'larpDisplayName', 'larpUsername', 'larpFollowers'], (result) => {
        if (result.fakeRobux !== undefined) robuxInput.value = result.fakeRobux;
        if (result.larpDisplayName !== undefined && displayNameInput) displayNameInput.value = result.larpDisplayName;
        if (result.larpUsername !== undefined && usernameInput) usernameInput.value = result.larpUsername;
        if (result.larpFollowers !== undefined && followerInput) followerInput.value = result.larpFollowers;
        renderTransactions(result.transactions || []);
    });

    saveBtn.addEventListener('click', () => {
        const amount = parseInt(robuxInput.value);
        const displayName = displayNameInput ? displayNameInput.value.trim() : '';
        const username = usernameInput ? usernameInput.value.trim() : '';
        const followers = followerInput ? parseInt(followerInput.value) || 0 : 0;
        if (isNaN(amount) && amount !== undefined) return;
        chrome.storage.local.set({ 
            fakeRobux: amount, 
            setFakeRobux: amount,
            larpDisplayName: displayName,
            larpUsername: username,
            larpFollowers: followers
        }, () => {
            showStatus('Changes Saved!');
        });
    });

    addTxBtn.addEventListener('click', () => {
        if (!txDesc || !txType || !txAmount || !txDate) return;
        const desc = txDesc.value.trim();
        const type = txType.value;
        const amount = parseInt(txAmount.value);
        const date = txDate.value || new Date().toISOString().split('T')[0];
        if (!desc || isNaN(amount)) { showStatus('Fill all fields'); return; }
        chrome.storage.local.get(['transactions'], (res) => {
            const txs = res.transactions || [];
            txs.push({ id: Math.random().toString(36).substr(2,9), description: desc, type, amount, date });
            chrome.storage.local.set({ transactions: txs }, () => {
                txDesc.value = ''; txAmount.value = ''; txDate.valueAsDate = new Date();
                renderTransactions(txs);
                showStatus('Transaction Added');
            });
        });
    });

    addItemBtn.addEventListener('click', async () => {
        const assetId = addItemIdInput.value.trim();
        if (!assetId) return;
        showStatus('Adding...');
        addItemBtn.disabled = true;
        try {
            let detailRes = await fetch(`https://economy.roblox.com/v2/assets/${assetId}/details`);
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
                                    inventory.push({ name: item.name, image: thumbsMap[item.id] || "", creator: bundleData.creator?.name || "Roblox", date: new Date().toISOString(), id: Math.random().toString(36).substr(2,9), assetId: item.id.toString(), limitedStatus: null });
                                }
                                chrome.storage.local.set({ inventory }, () => {
                                    addItemIdInput.value = '';
                                    showStatus('Bundle Added!');
                                    addItemBtn.disabled = false;
                                });
                            });
                            return;
                        }
                    }
                }
                throw new Error('Invalid Asset or Bundle ID');
            }
            const data = await detailRes.json();
            const thumbRes = await fetch(`https://thumbnails.roblox.com/v1/assets?assetIds=${assetId}&returnPolicy=PlaceHolder&size=420x420&format=Png&isCircular=false`);
            let imageUrl = '';
            if (thumbRes.ok) {
                const thumbData = await thumbRes.json();
                imageUrl = thumbData.data?.[0]?.imageUrl || '';
            }
            let limitedStatus = null;
            if (data.IsLimitedUnique) limitedStatus = 'limited_u';
            else if (data.IsLimited) limitedStatus = 'limited';
            chrome.storage.local.get(['inventory'], (result) => {
                const inventory = result.inventory || [];
                inventory.push({ name: data.Name || data.name || "Roblox Item", image: imageUrl, creator: data.Creator?.Name || "Roblox", date: new Date().toISOString(), id: Math.random().toString(36).substr(2,9), assetId: assetId, limitedStatus: limitedStatus });
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
            chrome.storage.local.remove(['fakeRobux', 'inventory', 'history', 'equipped', 'transactions', 'larpDisplayName', 'larpUsername', 'larpFollowers'], () => {
                robuxInput.value = 10000000;
                if (displayNameInput) displayNameInput.value = '';
                if (usernameInput) usernameInput.value = '';
                if (followerInput) followerInput.value = '';
                if (txList) txList.innerHTML = '';
                showStatus('Reset Complete');
            });
        }
    });
});