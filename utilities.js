/**
 * @file utilities.js
 * @description Utility functions for the extension.
 */

const checkHasExtensionBeenUpdated = (() => {
    const messageExtensionHasBeenUpdated = chrome.i18n.getMessage('messageExtensionHasBeenUpdated');
    return () => {
        try {
            chrome.i18n.getMessage('messageExtensionHasBeenUpdated');
        }
        catch (e) {
            window.alert(messageExtensionHasBeenUpdated);
            return true;
        }

        return false;
    }
})();

function sendChromeMessage(request) {
    (async () => {
        request.extensionId = chrome.runtime.id;
        await chrome.runtime.sendMessage(request);
    })();
}

function isRootWindow() {
    return window === window.parent;
}

function isInIFrame() {
    return window !== window.parent;
}

function getRootWindow() {
    let w = window;
    while (w !== w.parent) {
        w = w.parent;
    }
    return w;
}

function computeDirection(x, y) {
    const THRESHOLD = Math.PI / 8;  // 斜め方向を無視
    const radian = Math.atan2(y, x);
    if (Math.abs(radian) <= THRESHOLD) {
        return '→';
    }
    else if (Math.abs(radian - Math.PI / 2) <= THRESHOLD) {
        return '↓';
    }
    else if (Math.abs(radian + Math.PI / 2) <= THRESHOLD) {
        return '↑';
    }
    else if (Math.PI - Math.abs(radian) <= THRESHOLD) {
        return '←';
    }
    return undefined;
}
