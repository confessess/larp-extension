// LarpBlox - Follower Spoofer

function handleFollowerChanges() {
    if (!state.larpFollowers && state.larpFollowers !== 0) return;

    const followers = state.larpFollowers;
    const formatted = followers >= 1000000 
        ? (followers / 1000000).toFixed(1) + 'M+'
        : followers >= 1000 
            ? (followers / 1000).toFixed(1) + 'K+'
            : followers.toLocaleString();

    // Target the exact element the user found
    // <span class="padding-y-xsmall text-no-wrap text-truncate-end">1.6K Followers</span>
    document.querySelectorAll('.padding-y-xsmall.text-no-wrap.text-truncate-end').forEach(el => {
        const current = el.textContent.trim();
        // Only change if it contains "Followers"
        if (/Followers/i.test(current)) {
            const newText = formatted + ' Followers';
            if (current !== newText) {
                el.textContent = newText;
            }
        }
    });
}