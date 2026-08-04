// LarpBlox - Avatar Editor Injection

function handleInventoryInjection() {
    const isAvatar = window.location.href.includes('/my/avatar');
    if (!isAvatar) return;

    const gridSelectors = [
        '.avatar-cards',
        '[data-testid="category-items"]',
        '.item-cards-stackable',
        '.item-list',
        '#assets-items ul',
        '.items-list',
        '.item-card-list',
        '.avatar-editor-avatar-card-grid',
        '.asset-cards',
        '.card-list',
        '.hlist'
    ];

    let grid = null;

    for (const selector of gridSelectors) {
        grid = document.querySelector(selector);
        if (grid) break;
    }

    if (!grid) return;

    const realCard = grid.querySelector(
        '.item-card:not([data-sim-id])'
    );

    state.inventory.forEach(item => {

        if (grid.querySelector(`[data-sim-id="${item.id}"]`))
            return;

        const isEquipped =
            (state.equipped || []).includes(item.id);

        let limitedBadge = '';

        if (item.limitedStatus === 'limited_u') {
            limitedBadge = `
                <span class="restriction-icon icon-limited-unique-label"></span>
            `;
        }
        else if (item.limitedStatus === 'limited') {
            limitedBadge = `
                <span class="restriction-icon icon-limited-label"></span>
            `;
        }

        // White box with black checkmark - matches Roblox native equipped style
        const equippedBadge = isEquipped ? `
            <div class="larp-equipped-badge">
                <div class="larp-equipped-check"></div>
            </div>
        ` : '';

        const itemHTML = `
        <li class="item-card avatar-card ${isEquipped ? 'larp-equipped' : ''}"
            data-sim-id="${item.id}">

            <a href="#"
               class="item-card-thumb-container"
               data-item-name="${item.name}"
               data-availability-status="Available">

                <div class="item-card-thumb"
                     data-thumbnail-target-id="${item.id}"
                     data-thumbnail-type="Asset">

                    ${equippedBadge}

                    <span class="thumbnail-2d-container">

                        <img class=""
                             src="${item.image || ROBLOX_LOGO_URL}"
                             alt="">

                    </span>

                    ${limitedBadge}

                </div>

            </a>

            <div class="item-card-details">

                <div class="item-card-name"
                     title="${item.name}">
                    ${item.name}
                </div>

            </div>

        </li>
        `.replace(/>\s+</g, '><').trim();

        grid.insertAdjacentHTML(
            'beforeend',
            itemHTML
        );

        const el =
            grid.querySelector(
                `[data-sim-id="${item.id}"]`
            );

        if (!el) return;

        // Match Roblox card spacing
        if (realCard) {

            const styles =
                window.getComputedStyle(realCard);

            [
                "width",
                "height",
                "minWidth",
                "maxWidth",
                "margin",
                "padding",
                "boxSizing",
                "display",
                "flex",
                "flexGrow",
                "flexShrink",
                "flexBasis"
            ].forEach(prop => {

                el.style[prop] =
                    styles[prop];

            });
        }

        el.addEventListener('click', e => {

            e.preventDefault();

            state.equipped ||= [];

            if (state.equipped.includes(item.id)) {

                state.equipped =
                    state.equipped.filter(
                        id => id !== item.id
                    );

                el.classList.remove(
                    'larp-equipped'
                );

                el.querySelector(
                    '.larp-equipped-badge'
                )?.remove();

            } else {

                state.equipped.push(item.id);

                el.classList.add(
                    'larp-equipped'
                );

                if (!el.querySelector('.larp-equipped-badge')) {

                    el.querySelector(
                        '.item-card-thumb'
                    ).insertAdjacentHTML(
                        'afterbegin',
                        `
                        <div class="larp-equipped-badge">
                            <div class="larp-equipped-check"></div>
                        </div>
                        `
                    );

                }

            }

            chrome.storage.local.set({
                equipped: state.equipped
            });

            handleAvatarLarping();

        });

        // Repair thumbnails
        if ((!item.image || item.image === "") && item.assetId) {

            fetch(
                `https://thumbnails.roblox.com/v1/assets?assetIds=${item.assetId}&size=150x150&format=Png&isCircular=false`
            )
            .then(res => res.json())
            .then(data => {

                const url =
                    data?.data?.[0]?.imageUrl;

                if (url) {

                    item.image = url;

                    const img =
                        el.querySelector('img');

                    if (img)
                        img.src = url;

                    chrome.storage.local.set({
                        inventory: state.inventory
                    });

                }

            })
            .catch(err => {

                console.error(
                    "[LarpBlox] Thumbnail repair failed",
                    err
                );

            });

        }

    });
}