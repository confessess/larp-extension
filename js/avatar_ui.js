// LarpBlox - Avatar Editor Injection

function handleInventoryInjection() {
    const isAvatar = window.location.href.includes('/my/avatar');
    if (!isAvatar) return;

    const gridSelectors = [
        '.avatar-cards', '[data-testid="category-items"]', '.item-cards-stackable',
        '.item-list', '#assets-items ul', '.items-list', '.item-card-list',
        '.avatar-editor-avatar-card-grid', '.asset-cards', '.card-list', '.hlist'
    ];

    let grid = null;
    for (const sel of gridSelectors) {
        grid = document.querySelector(sel);
        if (grid) break;
    }

    if (grid) {
        const injectedIds = new Set(Array.from(grid.querySelectorAll('[data-sim-id]')).map(el => el.dataset.simId));
        state.inventory.forEach(item => {
            if (injectedIds.has(item.id)) return;

            const isEquipped = (state.equipped || []).includes(item.id);
            const showEquipped = isEquipped; // Always on avatar page
            const wrapperTag = 'li';
            const wrapperClass = 'avatar-card item-card';

            const checkBadge = showEquipped ? `
                <div class="item-card-equipped" data-item-status="equipped">
                    <div class="item-card-equipped-label"></div>
                    <span class="icon-check-selection"></span>
                </div>
            ` : '';

            let limitedBadge = '';
            if (item.limitedStatus === 'limited_u') limitedBadge = `<span class="restriction-icon icon-limited-unique-label"></span>`;
            else if (item.limitedStatus === 'limited') limitedBadge = `<span class="restriction-icon icon-limited-label"></span>`;

            const itemHtml = `
                <${wrapperTag} class="${wrapperClass}${showEquipped ? ' larp-equipped' : ''}" data-sim-id="${item.id}">
                    <div class="item-card-container">
                        <a href="#" class="item-card-link">
                            <div class="item-card-thumb-container">
                                ${checkBadge}
                                <div class="item-card-thumb-wrapper">
                                    <div class="thumbnail-2d-container">
                                        <img src="${item.image || ''}">
                                    </div>
                                    ${limitedBadge}
                                </div>
                            </div>
                            <div class="item-card-details">
                                <div class="item-card-name" title="${item.name}">${item.name}</div>
                            </div>
                        </a>
                    </div>
                </${wrapperTag} class="${wrapperClass}">
            `.replace(/>\s+</g, '><').trim();

            grid.insertAdjacentHTML('afterbegin', itemHtml);

            const el = grid.querySelector(`[data-sim-id="${item.id}"]`);
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const currentEquipped = state.equipped || [];
                if (currentEquipped.includes(item.id)) {
                    state.equipped = currentEquipped.filter(id => id !== item.id);
                    el.classList.remove('larp-equipped');
                    const badge = el.querySelector('.item-card-equipped');
                    if (badge) badge.remove();
                } else {
                    state.equipped = [...currentEquipped, item.id];
                    el.classList.add('larp-equipped');
                    if (!el.querySelector('.item-card-equipped')) {
                        const thumbLink = el.querySelector('.item-card-thumb-container');
                        thumbLink.insertAdjacentHTML('afterbegin', `
                            <div class="item-card-equipped" data-item-status="equipped">
                                <div class="item-card-equipped-label"></div>
                                <span class="icon-check-selection"></span>
                            </div>
                        `);
                    }
                }
                chrome.storage.local.set({ equipped: state.equipped });
                handleAvatarLarping();
            });

            if ((!item.image || item.image === "") && item.assetId) {
                const fixThumbnail = async () => {
                    try {
                        let thumbUrl = "";
                        const assetRes = await fetch(`https://thumbnails.roblox.com/v1/assets?assetIds=${item.assetId}&size=150x150&format=Png&isCircular=false`);
                        const assetData = await assetRes.json();
                        thumbUrl = assetData?.data?.[0]?.imageUrl;

                        if (!thumbUrl || thumbUrl.includes('placeholder') || thumbUrl.includes('empty')) {
                            const bundleRes = await fetch(`https://thumbnails.roblox.com/v1/bundles/thumbnails?bundleIds=${item.assetId}&size=150x150&format=Png&isCircular=false`);
                            const bundleData = await bundleRes.json();
                            thumbUrl = bundleData?.data?.[0]?.imageUrl;
                        }

                        if (thumbUrl && !thumbUrl.includes('pending')) {
                            item.image = thumbUrl;
                            const targetEl = grid.querySelector(`[data-sim-id="${item.id}"] img`);
                            if (targetEl) targetEl.src = thumbUrl;
                            chrome.storage.local.set({ inventory: state.inventory });
                        } else {
                            const targetEl = grid.querySelector(`[data-sim-id="${item.id}"] img`);
                            if (targetEl && targetEl.src === "") targetEl.src = ROBLOX_LOGO_URL;
                        }
                    } catch (e) {
                        console.error("[LarpBlox] Repair failed for", item.name, e);
                    }
                };
                fixThumbnail();
            } else if (!item.image) {
                const targetEl = grid.querySelector(`[data-sim-id="${item.id}"] img`);
                if (targetEl) targetEl.src = ROBLOX_LOGO_URL;
            }
        });
    }
}
