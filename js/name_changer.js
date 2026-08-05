// LarpBlox - Name Changer

function handleNameChanges() {
    // --- Username (@handle) ---
    if (state.larpUsername) {
        document.querySelectorAll('.stylistic-alts-username').forEach(el => {
            const current = el.textContent.trim();
            const desired = '@' + state.larpUsername;
            if (current !== desired) {
                el.textContent = desired;
            }
        });
    }

    // --- Display Name ---
    if (!state.larpDisplayName) return;

    // #1: Profile header title
    document.querySelectorAll('#profile-header-title-container-name').forEach(el => {
        if (el.textContent.trim() !== state.larpDisplayName) {
            el.textContent = state.larpDisplayName;
        }
    });

    // #2: Age bracket label username
    document.querySelectorAll('.age-bracket-label-username').forEach(el => {
        if (el.textContent.trim() !== state.larpDisplayName) {
            el.textContent = state.larpDisplayName;
        }
    });

    // #3: Sidebar display name — ONLY the first li in the nav ul
    // This targets specifically the user profile link at the top of the sidebar
    document.querySelectorAll('nav ul > li:first-child .text-truncate-end.text-no-wrap').forEach(el => {
        const current = el.textContent.trim();
        if (current !== state.larpDisplayName) {
            el.textContent = state.larpDisplayName;
        }
    });
}