(function() {
    if (!window.location.href.includes('/transactions')) return;

    const STYLE_ID = 'larp-tx-style';
    function injectStyle() {
        if (document.getElementById(STYLE_ID)) return;
        const s = document.createElement('style');
        s.id = STYLE_ID;
        s.textContent = `
            .larp-tx-row td, .larp-tx-row { transition: background 0.15s; }
            .larp-tx-row:hover { background: rgba(139,92,246,0.06) !important; }
            .larp-tx-pos { color: #00b06f !important; font-weight: 600; }
            .larp-tx-neg { color: #ef4444 !important; font-weight: 600; }
            .larp-tx-date { color: #7c7a85; font-size: 0.85rem; white-space: nowrap; }
            .larp-tx-desc { font-weight: 500; color: inherit; }
            .larp-tx-type { font-size: 0.75rem; color: #7c7a85; margin-top: 2px; }
            .larp-tx-bal { font-weight: 600; color: inherit; }
        `;
        document.head.appendChild(s);
    }

    function robuxIconHtml() {
        const existing = document.querySelector('.icon-robux-16x16, .icon-robux');
        return existing ? existing.outerHTML : '<span style="font-weight:700;">R$</span>';
    }

    function inject() {
        chrome.storage.local.get(['transactions', 'fakeRobux'], (res) => {
            const txs = res.transactions || [];
            const bal = res.fakeRobux || 10000000;

            // Find the actual table body - Roblox uses specific classes
            const tbody = document.querySelector('.table-body, .table-tbody, tbody');
            if (!tbody) {
                // Page might not be fully loaded yet, try again
                setTimeout(inject, 500);
                return;
            }

            // Only hide REAL transaction rows, not headers or the whole page
            // Roblox transaction rows have specific data attributes
            const realRows = tbody.querySelectorAll('tr[data-item-id], tr[class*="transaction"], .list-item');
            realRows.forEach(r => {
                // Don't hide if it's already our row
                if (!r.classList.contains('larp-tx-row')) {
                    r.style.display = 'none';
                }
            });

            // Remove old larp rows to avoid duplicates
            tbody.querySelectorAll('.larp-tx-row').forEach(r => r.remove());

            const sorted = [...txs].sort((a, b) => new Date(b.date) - new Date(a.date));
            let running = bal;
            const rows = sorted.map(t => {
                const amt = parseInt(t.amount) || 0;
                const rowBal = running;
                running -= amt;
                return { ...t, amt, rowBal };
            });

            const sample = realRows[0];
            const tag = sample ? sample.tagName.toLowerCase() : 'tr';

            rows.forEach(t => {
                const el = document.createElement(tag);
                el.className = 'larp-tx-row';
                const pos = t.amt >= 0;
                const cls = pos ? 'larp-tx-pos' : 'larp-tx-neg';
                const sign = pos ? '+' : '';
                const icon = robuxIconHtml();

                if (sample && sample.querySelector('td')) {
                    const tds = Array.from(sample.querySelectorAll('td')).map((c, i) => {
                        if (i === 0) return `<td class="larp-tx-date">${new Date(t.date).toLocaleDateString()}</td>`;
                        if (i === 1) return `<td><div class="larp-tx-desc">${t.description}</div><div class="larp-tx-type">${t.type}</div></td>`;
                        if (i === 2) return `<td class="${cls}">${icon}<span style="margin-left:4px;">${sign}${t.amt.toLocaleString()}</span></td>`;
                        if (i === 3) return `<td class="larp-tx-bal">${icon}<span style="margin-left:4px;">${t.rowBal.toLocaleString()}</span></td>`;
                        return `<td></td>`;
                    });
                    el.innerHTML = tds.join('');
                } else if (sample && sample.querySelector('[class*="cell"]')) {
                    el.innerHTML = `
                        <div class="date-cell larp-tx-date">${new Date(t.date).toLocaleDateString()}</div>
                        <div class="description-cell"><div class="larp-tx-desc">${t.description}</div><div class="larp-tx-type">${t.type}</div></div>
                        <div class="amount-cell ${cls}">${sign}${t.amt.toLocaleString()}</div>
                        <div class="balance-cell larp-tx-bal">${t.rowBal.toLocaleString()}</div>
                    `;
                } else {
                    el.innerHTML = `
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                            <div><div class="larp-tx-desc">${t.description}</div><div class="larp-tx-type">${t.type} • ${new Date(t.date).toLocaleDateString()}</div></div>
                            <div style="text-align:right;"><div class="${cls}">${sign}${t.amt.toLocaleString()}</div><div style="font-size:0.75rem;color:#7c7a85;">Bal: ${t.rowBal.toLocaleString()}</div></div>
                        </div>`;
                }
                tbody.appendChild(el);
            });

            // Update balance displays
            document.querySelectorAll('.robux-balance, .amount.icon-robux-container, [data-testid="robux-amount"], .balance-label').forEach(el => {
                if (!el.closest('.larp-tx-row') && !el.closest('tr')) el.textContent = bal.toLocaleString();
            });
        });
    }

    injectStyle();
    
    // Wait for page to actually load before first inject
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject);
    } else {
        inject();
    }
    
    // Re-inject when content changes (SPA navigation)
    const obs = new MutationObserver(() => { 
        if (!document.querySelector('.larp-tx-row')) inject(); 
    });
    if (document.body) obs.observe(document.body, { childList: true, subtree: true });
})();