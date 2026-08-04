// LarpBlox - Global Styles and CSS Injection

function applyGlobalStyles() {
    if (document.getElementById('larp-global-styles')) return;
    const style = document.createElement('style');
    style.id = 'larp-global-styles';
    style.textContent = `
        .profile-avatar-accoutrements .hlist,
        .profile-avatar-accoutrements ul,
        .currently-wearing-list ul,
        .slide-item-container-inner.hlist {
            display: flex !important;
            flex-wrap: nowrap !important;
            width: max-content !important;
            min-width: 100% !important;
        }
        .profile-avatar-accoutrements .hlist > li,
        .profile-avatar-accoutrements ul > li,
        .currently-wearing-list ul > li {
            display: block !important;
            float: none !important;
            flex: 0 0 auto !important;
            margin-right: 12px !important;
        }
    `;
    (document.head || document.documentElement).appendChild(style);
}

// Add Global Style Fixes for Larp items
const larpStyle = document.createElement('style');
larpStyle.textContent = `
    :root {
        --larp-bg: #2B2E31;
        --larp-border: #393B3D;
        --larp-text: #FFFFFF;
        --larp-subtext: #ADB0B1;
        --larp-overlay: rgba(255, 255, 255, 0.05);
        --larp-modal-bg: #2B2E31;
        --larp-modal-hr: #393B3D;
        --larp-modal-text: #FFFFFF;
    }
    
    /* Roblox Light Theme overrides */
    [data-theme-light], .light-theme {
        --larp-bg: #EBEDEF;
        --larp-border: #D6D6D6;
        --larp-text: #191B1D;
        --larp-subtext: #656667;
        --larp-overlay: rgba(0, 0, 0, 0.05);
        --larp-modal-bg: #FFFFFF;
        --larp-modal-hr: #E3E3E3;
        --larp-modal-text: #191B1D;
    }

    .avatar-card[data-sim-id], .list-item[data-sim-id].item-card {
        list-style: none !important;
        position: relative !important;
    }
    .item-card-container.remove-panel {
        width: 100% !important;
    }
    /* Equipped state - dark overlay + checkmark */
    [data-sim-id] .item-card-thumb-container {
        position: relative;
        display: block;
    }
    [data-sim-id].larp-equipped .item-card-thumb-container::after {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: var(--larp-overlay);
        border-radius: 4px;
        z-index: 5;
        pointer-events: none;
    }
    [data-sim-id] { cursor: pointer; }
    
    .larp-wearing-item, .larp-thumb-bg {
        background: var(--larp-bg) !important;
        border: none !important;
    }
    
    .larp-wearing-item img, .larp-thumb-bg img {
        background: transparent !important;
    }

    [data-sim-id] .item-card-name {
        margin-top: 2px !important;
        font-size: 14px !important;
        font-weight: 700 !important;
        color: var(--larp-text) !important;
        line-height: 1.2 !important;
        max-height: 34px !important;
        overflow: hidden !important;
        display: -webkit-box !important;
        -webkit-line-clamp: 2 !important;
        -webkit-box-orient: vertical !important;
    }
    [data-sim-id] .item-card-creator {
        font-size: 12px !important;
        color: var(--larp-subtext) !important;
        margin-top: 4px !important;
        line-height: 1.2 !important;
        height: 14px !important;
        overflow: hidden !important;
    }
    [data-sim-id] .item-card-creator .text-name {
        font-size: 12px !important;
        color: var(--larp-text) !important;
        font-weight: 400 !important;
    }
    [data-sim-id] .item-card-price {
        font-size: 14px !important;
        font-weight: 700 !important;
        color: var(--larp-subtext) !important;
        margin-top: 7px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: flex-start !important;
        line-height: 1 !important;
    }
    [data-sim-id] .item-card-price .icon-robux-16x16 {
        margin-right: 1px !important;
        transform: translateY(-0.5px) !important;
        vertical-align: middle !important;
        flex-shrink: 0 !important;
    }
    [data-sim-id] .item-card-price .text-label {
        font-size: 11px !important;
        color: var(--larp-subtext) !important;
    }

    .item-card-thumb-container-inner.larp-thumb-bg {
        background: var(--larp-bg) !important;
    }

    /* Modal Styling */
    .larp-modal {
        background: var(--larp-modal-bg) !important;
        color: var(--larp-modal-text) !important;
    }
    .larp-modal hr {
        border-top: 1px solid var(--larp-modal-hr) !important;
    }
    .larp-modal p, .larp-modal div {
        color: var(--larp-modal-text) !important;
    }
    .larp-modal img {
        display: inline-block !important;
        color: unset !important;
    }
    .larp-modal-thumb-bg {
        background: var(--larp-bg) !important;
    }
    .larp-modal-close {
        color: var(--larp-subtext) !important;
    }
    .larp-modal-secondary-btn {
        background: var(--larp-bg) !important;
        color: var(--larp-text) !important;
    }
`;
document.head.appendChild(larpStyle);
