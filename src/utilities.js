/**
 * @file utilities.js
 * @description Utility functions for the extension.
 */

/**
 * @typedef {object} Point
 * @property {number} x - The x coordinate of the point.
 * @property {number} y - The y coordinate of the point.
 */

/**
 * @summary Check if the extension has been updated.
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

/**
 * @summary Send a message to the service worker.
 */
function sendChromeMessage(request) {
    (async () => {
        request.extensionId = chrome.runtime.id;
        await chrome.runtime.sendMessage(request);
    })();
}

/**
 * @summary Check if the script is running in a root window.
 * @returns {boolean} - True if the srcript is running in a root window, false otherwise.
 */
function isInRootWindow() {
    return window === window.parent;
}

/**
 * @summary Check if the script is running in an iframe.
 * @returns {boolean} - True if the script is running in an iframe, false otherwise.
 */
function isInIFrame() {
    return window !== window.parent;
}

/**
 * @summary Get the root window object.
 * @returns {Window} - The root window object.
 */
function getRootWindow() {
    let w = window;
    while (w !== w.parent) {
        w = w.parent;
    }
    return w;
}

/**
 * @summary Compute direction based on distance x and distance y.
 * @param {number} x
 * @param {number} y 
 * @returns {string|undefined} - One of the four directions: '→', '↑', '←', '↓', or undefined if the direction is diagonal.
 */
function computeDirection(x, y) {
    const THRESHOLD = Math.PI / 6;  // Ignore diagonal directions
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

/**
 * @summary Compute direction based on distance x and distance y.
 * @param {number} x
 * @param {number} y 
 * @returns {string} - One of the eight directions: '→', '↗', '↑', '↖', '←', '↙', '↓', '↘'.
 */
function compute8Direction(x, y) {
    const radian = Math.atan2(y, x);
    if (radian >= -Math.PI / 8 && radian < Math.PI / 8) {
        return '→';
    }
    else if (radian >= Math.PI / 8 && radian < 3 * Math.PI / 8) {
        return '↘';
    }
    else if (radian >= 3 * Math.PI / 8 && radian < 5 * Math.PI / 8) {
        return '↓';
    }
    else if (radian >= 5 * Math.PI / 8 && radian < 7 * Math.PI / 8) {
        return '↙';
    }
    else if (radian >= -3 * Math.PI / 8 && radian < -Math.PI / 8) {
        return '↗';
    }
    else if (radian >= -5 * Math.PI / 8 && radian < -3 * Math.PI / 8) {
        return '↑';
    }
    else if (radian >= -7 * Math.PI / 8 && radian < -5 * Math.PI / 8) {
        return '↖';
    }
    else {
        return '←';
    }
}
