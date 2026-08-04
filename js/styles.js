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
        --larp-overlay: rgba(0, 0, 0, 0.55);
        --larp-modal-bg: #2B2E31;
        --larp-modal-hr: #393B3D;
        --larp-modal-text: #FFFFFF;
    }


    [data-theme-light], .light-theme {
        --larp-bg: #EBEDEF;
        --larp-border: #D6D6D6;
        --larp-text: #191B1D;
        --larp-subtext: #656667;
        --larp-overlay: rgba(0, 0, 0, 0.45);
        --larp-modal-bg: #FFFFFF;
        --larp-modal-hr: #E3E3E3;
        --larp-modal-text: #191B1D;
    }



    /* Larp injected cards */
    .avatar-card[data-sim-id],
    .list-item[data-sim-id].item-card {

        list-style: none !important;
        position: relative !important;
        box-sizing: border-box !important;
    }



    /* Equipped state */
    [data-sim-id] {
        cursor: pointer;
    }


    [data-sim-id] .item-card-thumb-container {

        position: relative !important;

        display: block !important;
    }



    /* Dark overlay while worn */
    [data-sim-id].larp-equipped 
    .item-card-thumb-container::after {

        content: "";

        position: absolute;

        inset: 0;

        background: rgba(0, 0, 0, 0.55);

        border-radius: 6px;

        z-index: 10;

        pointer-events: none;
    }



  /* Roblox style equipped check */
[data-sim-id].larp-equipped 
.item-card-thumb-container::before {

    content: "";

    position: absolute;

    top: 10px;

    right: 10px;

    width: 12px;

    height: 7px;

    border-left: 3px solid white;

    border-bottom: 3px solid white;

    transform: rotate(-45deg);

    z-index: 20;

    filter: drop-shadow(0 1px 2px rgba(0,0,0,.65));

    pointer-events: none;
}



    /* Item name */
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



    [data-sim-id] .item-card-price {

        font-size: 14px !important;

        font-weight: 700 !important;

        color: var(--larp-subtext) !important;

        margin-top: 7px !important;

        display: flex !important;

        align-items: center !important;
    }



    .larp-wearing-item,
    .larp-thumb-bg {

        background: var(--larp-bg) !important;

        border: none !important;
    }



    .larp-wearing-item img,
    .larp-thumb-bg img {

        background: transparent !important;
    }



    /* Modal Styling */
    .larp-modal {

        background: var(--larp-modal-bg) !important;

        color: var(--larp-modal-text) !important;
    }


    .larp-modal hr {

        border-top: 1px solid var(--larp-modal-hr) !important;
    }


    .larp-modal p,
    .larp-modal div {

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