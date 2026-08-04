// LarpBlox - State Management
var state = {
    fakeRobux: 10000000,
    setFakeRobux: 10000000,
    inventory: [],
    history: [],
    equipped: [],
    larpId: null, // UserID to spoof the avatar image from
    uiMode: 'auto' // 'auto' | 'light' | 'dark' for buy dialog and Robux icon
};

const ROBUX_ICON_URL = chrome.runtime.getURL('robux.png');      // dark mode (light icon)
const ROBUX_ICON_LIGHT_URL = chrome.runtime.getURL('robux2.png'); // light mode (dark icon)
const ROBLOX_LOGO_URL = chrome.runtime.getURL('roblox_logo.png');
