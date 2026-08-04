(function () {
    console.log('[LarpBlox] 2D-Only Hook Loaded');

    // Intercept Avatar Color changes
    const origFetch = window.fetch;
    window.fetch = async function (...args) {
        const url = (args[0] && typeof args[0] === 'string') ? args[0] : (args[0]?.url || '');
        if (url.includes('/v1/avatar/set-body-colors')) {
            try {
                const bodyJson = (args[0] && args[0].body) ? args[0].body : args[1]?.body;
                if (bodyJson) {
                    const body = JSON.parse(bodyJson);
                    window.postMessage({ type: 'LARP_BODY_COLORS_UPDATED', colors: body }, '*');
                }
            } catch (e) { }
        }
        return origFetch.apply(this, args);
    };

    const origOpen = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function (method, url) {
        this._url = url;
        return origOpen.apply(this, arguments);
    };

    const origSend = window.XMLHttpRequest.prototype.send;
    window.XMLHttpRequest.prototype.send = function (data) {
        if (this._url && this._url.includes('/v1/avatar/set-body-colors') && data) {
            try {
                const body = JSON.parse(data);
                window.postMessage({ type: 'LARP_BODY_COLORS_UPDATED', colors: body }, '*');
            } catch (e) { }
        }
        return origSend.apply(this, arguments);
    };

    // Support for 10+ accessories in native menus if the user opens them
    function patchService() {
        if (window.Roblox && window.Roblox.AvatarAccoutrementService) {
            const service = window.Roblox.AvatarAccoutrementService;
            if (service.__larpPatched) return;
            service.__larpPatched = true;
            if (service.getAdvancedAccessoryLimit) {
                service.getAdvancedAccessoryLimit = function () { return 100; };
            }
        } else {
            setTimeout(patchService, 500);
        }
    }
    patchService();
})();
