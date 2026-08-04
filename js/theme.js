// LarpBlox - Theme Detection
function detectPageTheme() {
    try {
        // Prefer explicit theme markers Roblox might use
        if (document.body) {
            const body = document.body;
            if (body.classList && (body.classList.contains('dark-theme') || body.classList.contains('theme-dark'))) return 'dark';
            const bt = body.getAttribute('data-theme');
            if (bt && bt.toLowerCase().includes('dark')) return 'dark';
        }
        if (document.documentElement) {
            const html = document.documentElement;
            if (html.classList && (html.classList.contains('dark-theme') || html.classList.contains('theme-dark'))) return 'dark';
            const ht = html.getAttribute('data-theme');
            if (ht && ht.toLowerCase().includes('dark')) return 'dark';
        }
        if (document.querySelector && document.querySelector('.dark-theme, .theme-dark')) return 'dark';

        // Fallback: inspect background color luminance
        const target = document.body || document.documentElement;
        if (target && window.getComputedStyle) {
            const bg = getComputedStyle(target).backgroundColor;
            const m = bg && bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
            if (m) {
                const r = parseInt(m[1], 10), g = parseInt(m[2], 10), b = parseInt(m[3], 10);
                const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                if (luminance < 0.5) return 'dark';
            }
        }
    } catch (e) { }
    return 'light';
}

function getResolvedTheme() {
    // Always auto-detect now that popup no longer exposes a manual theme.
    return detectPageTheme();
}

function getRobuxIconUrl() {
    return (getResolvedTheme() === 'dark') ? ROBUX_ICON_URL : ROBUX_ICON_LIGHT_URL;
}
