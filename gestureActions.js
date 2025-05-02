/**
 * @file gestureActions.js
 * @description Mouse gesture actions for the extension.
 */

/**
 * @summary Get the gesture actions for the extension.
 * @returns {Object} - An object containing gesture actions.
 */
function getGestureActions() {
    return {
        back: () => {
            if (isRootWindow()) {
                window.history.go(-1);
            }
            else {
                getRootWindow().postMessage({
                    extensionId: chrome.runtime.id,
                    type: 'execute-action',
                    action: 'back',
                    option: undefined,
                },
                    '*');
            }
        },
        forward: () => {
            if (isRootWindow()) {
                window.history.go(1);
            }
            else {
                getRootWindow().postMessage({
                    extensionId: chrome.runtime.id,
                    type: 'execute-action',
                    action: 'forward',
                    option: undefined,
                },
                    '*');
            }
        },
        scrollup: (option) => {
            if (isRootWindow()) {
                const element = option.target || document.documentElement;
                if (scrollUpElement(element)) {
                    window.scrollBy({ top: -0.8 * window.innerHeight, behavior: 'auto' });
                }
            }
            else {
                if (scrollUpElement(option.target)) {
                    option.target = undefined;  // 別のwindowからliveなHTMLElementにはアクセスできないため削除
                    getRootWindow().postMessage({
                        extensionId: chrome.runtime.id,
                        type: 'execute-action',
                        action: 'scrollup',
                        option: option,
                    },
                        '*');
                }
            }
        },
        scrolldown: (option) => {
            if (isRootWindow()) {
                const element = option.target || document.documentElement;
                if (scrollDownElement(element)) {
                    window.scrollBy({ top: 0.8 * window.innerHeight, behavior: 'auto' });
                }
            }
            else {
                if (scrollDownElement(option.target)) {
                    option.target = undefined;  // 別のwindowからliveなHTMLElementにはアクセスできないため削除
                    getRootWindow().postMessage({
                        extensionId: chrome.runtime.id,
                        type: 'execute-action',
                        action: 'scrolldown',
                        option: option,
                    },
                        '*');
                }
            }
        },
        scrollleft: (option) => {
            if (isRootWindow()) {
                const element = option.target || document.documentElement;
                if (scrollLeftElement(element)) {
                    window.scrollBy({ left: -0.8 * window.innerWidth, behavior: 'auto' });
                }
            }
            else {
                if (scrollLeftElement(option.target)) {
                    option.target = undefined;  // 別のwindowからliveなHTMLElementにはアクセスできないため削除
                    getRootWindow().postMessage({
                        extensionId: chrome.runtime.id,
                        type: 'execute-action',
                        action: 'scrollleft',
                        option: option,
                    },
                        '*');
                }
            }
        },
        scrollright: (option) => {
            if (isRootWindow()) {
                const element = option.target || document.documentElement;
                if (scrollRightElement(element)) {
                    window.scrollBy({ left: 0.8 * window.innerWidth, behavior: 'auto' });
                }
            }
            else {
                if (scrollRightElement(option.target)) {
                    option.target = undefined;  // 別のwindowからliveなHTMLElementにはアクセスできないため削除
                    getRootWindow().postMessage({
                        extensionId: chrome.runtime.id,
                        type: 'execute-action',
                        action: 'scrollright',
                        option: option,
                    },
                        '*');
                }
            }
        },
        scrolltotop: (option) => {
            if (isRootWindow()) {
                const element = option.target || document.documentElement;
                if (scrollTopElement(element)) {
                    window.scroll({ top: 0, behavior: 'auto' });
                }
            }
            else {
                if (scrollTopElement(option.target)) {
                    option.target = undefined;  // 別のwindowからliveなHTMLElementにはアクセスできないため削除
                    getRootWindow().postMessage({
                        extensionId: chrome.runtime.id,
                        type: 'execute-action',
                        action: 'scrolltotop',
                        option: option,
                    },
                        '*');
                }
            }
        },
        scrolltobottom: (option) => {
            if (isRootWindow()) {
                const element = option.target || document.documentElement;
                if (scrollBottomElement(element)) {
                    window.scroll({ top: document.documentElement.scrollHeight, behavior: 'auto' });
                }
            }
            else {
                if (scrollBottomElement(option.target)) {
                    option.target = undefined;  // 別のwindowからliveなHTMLElementにはアクセスできないため削除
                    getRootWindow().postMessage({
                        extensionId: chrome.runtime.id,
                        type: 'execute-action',
                        action: 'scrolltobottom',
                        option: option,
                    },
                        '*');
                }
            }
        },
        scrolltoleftmost: (option) => {
            if (isRootWindow()) {
                const element = option.target || document.documentElement;
                if (scrollLeftmostElement(element)) {
                    window.scroll({ left: 0, behavior: 'auto' });
                }
            }
            else {
                if (scrollLeftmostElement(option.target)) {
                    option.target = undefined;  // 別のwindowからliveなHTMLElementにはアクセスできないため削除
                    getRootWindow().postMessage({
                        extensionId: chrome.runtime.id,
                        type: 'execute-action',
                        action: 'scrolltoleftmost',
                        option: option,
                    },
                        '*');
                }
            }
        },
        scrolltorightmost: (option) => {
            if (isRootWindow()) {
                const element = option.target || document.documentElement;
                if (scrollRightmostElement(element)) {
                    window.scroll({ left: document.documentElement.scrollWidth, behavior: 'auto' });
                }
            }
            else {
                if (scrollRightmostElement(option.target)) {
                    option.target = undefined;  // 別のwindowからliveなHTMLElementにはアクセスできないため削除
                    getRootWindow().postMessage({
                        extensionId: chrome.runtime.id,
                        type: 'execute-action',
                        action: 'scrolltorightmost',
                        option: option,
                    },
                        '*');
                }
            }
        },
        createtab: () => {
            sendChromeMessage({ action: 'createtab' });
        },
        addtabtogroup: () => {
            sendChromeMessage({ action: 'addtabtogroup' });
        },
        removetabfromgroup: () => {
            sendChromeMessage({ action: 'removetabfromgroup' });
        },
        duplicatetab: () => {
            sendChromeMessage({ action: 'duplicatetab' });
        },
        pintab: () => {
            sendChromeMessage({ action: 'pintab' });
        },
        closetab: () => {
            sendChromeMessage({ action: 'closetab' });
        },
        closetableftall: () => {
            sendChromeMessage({ action: 'closetableftall' });
        },
        closetabrightall: () => {
            sendChromeMessage({ action: 'closetabrightall' });
        },
        closetabotherall: () => {
            sendChromeMessage({ action: 'closetabotherall' });
        },
        reopenclosedtab: () => {
            sendChromeMessage({ action: 'reopenclosedtab' });
        },
        reloadtab: () => {
            sendChromeMessage({ action: 'reloadtab' });
        },
        reloadtabhard: () => {
            sendChromeMessage({ action: 'reloadtabhard' });
        },
        reloadtaball: () => {
            sendChromeMessage({ action: 'reloadtaball' });
        },
        gotolefttab: (option) => {
            sendChromeMessage({ action: 'gotolefttab', shouldPreventContextMenu: option.shouldPreventContextMenu });
        },
        gotorighttab: (option) => {
            sendChromeMessage({ action: 'gotorighttab', shouldPreventContextMenu: option.shouldPreventContextMenu });
        },
        gotolefttabwithloop: (option) => {
            sendChromeMessage({ action: 'gotolefttabwithloop', shouldPreventContextMenu: option.shouldPreventContextMenu });
        },
        gotorighttabwithloop: (option) => {
            sendChromeMessage({ action: 'gotorighttabwithloop', shouldPreventContextMenu: option.shouldPreventContextMenu });
        },
        gotomostlefttab: (option) => {
            sendChromeMessage({ action: 'gotomostlefttab', shouldPreventContextMenu: option.shouldPreventContextMenu });
        },
        gotomostrighttab: (option) => {
            sendChromeMessage({ action: 'gotomostrighttab', shouldPreventContextMenu: option.shouldPreventContextMenu });
        },
        gotoprevioustab: (option) => {
            sendChromeMessage({ action: 'gotoprevioustab', shouldPreventContextMenu: option.shouldPreventContextMenu });
        },
        gotoprevioustabloop: (option) => {
            sendChromeMessage({ action: 'gotoprevioustabloop', shouldPreventContextMenu: option.shouldPreventContextMenu });
        },
        gotonexttab: (option) => {
            sendChromeMessage({ action: 'gotonexttab', shouldPreventContextMenu: option.shouldPreventContextMenu });
        },
        gotonexttabloop: (option) => {
            sendChromeMessage({ action: 'gotonexttabloop', shouldPreventContextMenu: option.shouldPreventContextMenu });
        },
        addbookmark: () => {
            sendChromeMessage({ action: 'addbookmark', bookmark: { title: document.title, url: document.location.href } });
        },
        upsertbookmark: () => {
            sendChromeMessage({ action: 'upsertbookmark', bookmark: { title: document.title, url: document.location.href } });
        },
        deletebookmark: () => {
            sendChromeMessage({ action: 'deletebookmark', bookmark: { url: document.location.href } });
        },
        createwindow: () => {
            sendChromeMessage({ action: 'createwindow' });
        },
        closewindow: () => {
            sendChromeMessage({ action: 'closewindow' });
        },
        closewindowall: () => {
            sendChromeMessage({ action: 'closewindowall' });
        },
        maximizewindow: () => {
            sendChromeMessage({ action: 'maximizewindow' });
        },
        minimizewindow: () => {
            sendChromeMessage({ action: 'minimizewindow' });
        },
        fullscreenwindow: () => {
            sendChromeMessage({ action: 'fullscreenwindow' });
        },
        copyurl: () => {
            if (isRootWindow()) {
                navigator.clipboard.writeText(document.location.href).then(() => { });
                alert(`${chrome.i18n.getMessage('messageCopied')}\n ${document.location.href}`);
            }
            else {
                getRootWindow().postMessage({
                    extensionId: chrome.runtime.id,
                    type: 'execute-action',
                    action: 'copyurl',
                    option: undefined,
                },
                    '*');
            }
        },
        copytitle: () => {
            if (isRootWindow()) {
                navigator.clipboard.writeText(document.title).then(() => { });
                alert(`${chrome.i18n.getMessage('messageCopied')}\n ${document.title}`);
            }
            else {
                getRootWindow().postMessage({
                    extensionId: chrome.runtime.id,
                    type: 'execute-action',
                    action: 'copytitle',
                    option: undefined,
                },
                    '*');
            }
        },
        mutetab: () => {
            sendChromeMessage({ action: 'mutetab' });
        },
        unmutetab: () => {
            sendChromeMessage({ action: 'unmutetab' });
        },
        mutetabtoggle: () => {
            sendChromeMessage({ action: 'mutetabtoggle' });
        },
        mutetaball: () => {
            sendChromeMessage({ action: 'mutetaball' });
        },
        unmutetaball: () => {
            sendChromeMessage({ action: 'unmutetaball' });
        },
        zoomin: () => {
            sendChromeMessage({ action: 'zoomin' });
        },
        zoomout: () => {
            sendChromeMessage({ action: 'zoomout' });
        },
        zoomdefault: () => {
            sendChromeMessage({ action: 'zoomdefault' });
        },
        openlinkinnwetab: (option) => {
            if (option.url) {
                sendChromeMessage({ action: 'openlinkinnwetab', url: option.url });
            }
        },
        openlinkinnwetabandactivate: (option) => {
            if (option.url) {
                sendChromeMessage({ action: 'openlinkinnwetabandactivate', url: option.url });
            }
        },
        openlinkinnwewindow: (option) => {
            if (option.url) {
                sendChromeMessage({ action: 'openlinkinnwewindow', url: option.url });
            }
        },
        openlinkinnwewindowandactivate: (option) => {
            if (option.url) {
                sendChromeMessage({ action: 'openlinkinnwewindowandactivate', url: option.url });
            }
        },
        openimageinnewtab: (option) => {
            if (option.src) {
                sendChromeMessage({ action: 'openlinkinnwetab', url: option.src });
            }
        },
        openimageinnewtabandactivate: (option) => {
            if (option.src) {
                sendChromeMessage({ action: 'openlinkinnwetabandactivate', url: option.src });
            }
        },
        openimageinnewwindow: (option) => {
            if (option.src) {
                sendChromeMessage({ action: 'openlinkinnwewindow', url: option.src });
            }
        },
        openimageinnewwindowandactivate: (option) => {
            if (option.src) {
                sendChromeMessage({ action: 'openlinkinnwewindowandactivate', url: option.src });
            }
        },
        openoptionspage: () => {
            sendChromeMessage({ action: 'openoptionspage' });
        },
        disableextension: () => {
            window.postMessage({ extensionId: chrome.runtime.id, type: 'disable-mousegesture' }, '*');
        }
    };
}

/**
 * @summary Check if scrolling is possible in the x direction.
 * @param {HTMLElement} element - The element to check.
 * @returns {boolean} - True if scrolling is possible, false otherwise.
 */
function canScrollX(element) {
    if (typeof element.scrollWidth === 'undefined' || typeof element.clientWidth === 'undefined') {
        return false;
    }
    if (element.scrollWidth <= element.clientWidth) {
        return false;
    }

    if (element.tagName === 'HTML') {
        return false;
    }

    const style = window.getComputedStyle(element);
    const overflow = style.overflowX || style.overflow;
    if (overflow !== 'auto' && overflow !== 'scroll') {
        return false;
    }

    return true;
}

/**
 * @summary Check if scrolling is possible in the y direction.
 * @param {HTMLElement} element - The element to check.
 * @returns {boolean} - True if scrolling is possible, false otherwise.
 */
function canScrollY(element) {
    if (typeof element.scrollHeight === 'undefined' || typeof element.clientHeight === 'undefined') {
        return false;
    }

    if (element.scrollHeight <= element.clientHeight) {
        return false;
    }

    if (element.tagName === 'HTML') {
        return false;
    }

    const style = window.getComputedStyle(element);
    const overflow = style?.overflowY || style?.overflow;
    if (overflow !== 'auto' && overflow !== 'scroll' && overflow !== undefined) {
        return false;
    }

    return true;
}

/**
 * @summary Scroll up the specified element or upper-level HTMLElement if it is scrollable.
 * @param {HTMLElement} element - The element to scroll.
 * @returns {boolean} - True if no scrolling occurred, false if scrolling occurred.
 */
function scrollUpElement(element) {
    for (; element; element = element.parentNode) {
        if (canScrollY(element) &&
            (element.scrollTop !== 0)
        ) {
            element.scrollBy({ top: -element.clientHeight * 0.8, behavior: 'auto' });
            return false;
        }
    }

    return true;
}

/**
 * @summary Scroll down the specified element or upper-level HTMLElement if it is scrollable.
 * @param {HTMLElement} element - The element to scroll.
 * @returns {boolean} - True if no scrolling occurred, false if scrolling occurred.
 */
function scrollDownElement(element) {
    for (; element; element = element.parentNode) {
        if (canScrollY(element) &&
            (Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop) >= 1)
        ) {
            element.scrollBy({ top: element.clientHeight * 0.8, behavior: 'auto' });
            return false;
        }
    }

    return true;
}

/**
 * @summary Scroll left the specified element or upper-level HTMLElement if it is scrollable.
 * @param {HTMLElement} element - The element to scroll.
 * @returns {boolean} - True if no scrolling occurred, false if scrolling occurred.
 */
function scrollLeftElement(element) {
    for (; element; element = element.parentNode) {
        if (canScrollX(element) &&
            (element.scrollLeft !== 0)
        ) {
            element.scrollBy({ left: -element.clientWidth * 0.8, behavior: 'auto' });
            return false;
        }
    }

    return true;
}

/**
 * @summary Scroll right the specified element or upper-level HTMLElement if it is scrollable.
 * @param {HTMLElement} element - The element to scroll.
 * @returns {boolean} - True if no scrolling occurred, false if scrolling occurred.
 */
function scrollRightElement(element) {
    for (; element; element = element.parentNode) {
        if (canScrollX(element) &&
            (Math.abs(element.scrollWidth - element.clientWidth - element.scrollLeft) >= 1)
        ) {
            element.scrollBy({ left: element.clientWidth * 0.8, behavior: 'auto' });
            return false;
        }
    }

    return true;
}

/**
 * @summary Scroll to the top of the specified element or upper-level HTMLElement if it is scrollable.
 * @param {HTMLElement} element - The element to scroll.
 * @returns {boolean} - True if no scrolling occurred, false if scrolling occurred.
 */
function scrollTopElement(element) {
    for (; element; element = element.parentNode) {
        if (canScrollY(element) &&
            (element.scrollTop !== 0)
        ) {
            element.scroll({ top: 0, behavior: 'auto' });
            return false;
        }
    }

    return true;
}

/**
 * @summary Scroll to the bottom of the specified element or upper-level HTMLElement if it is scrollable.
 * @param {HTMLElement} element - The element to scroll.
 * @returns {boolean} - True if no scrolling occurred, false if scrolling occurred.
 */
function scrollBottomElement(element) {
    for (; element; element = element.parentNode) {
        if (canScrollY(element) &&
            (Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop) >= 1)
        ) {
            element.scroll({ top: element.scrollHeight, behavior: 'auto' });
            return false;
        }
    }

    return true;
}

/**
 * @summary Scroll to the leftmost of the specified element or upper-level HTMLElement if it is scrollable.
 * @param {HTMLElement} element - The element to scroll.
 * @returns {boolean} - True if no scrolling occurred, false if scrolling occurred.
 */
function scrollLeftmostElement(element) {
    for (; element; element = element.parentNode) {
        if (canScrollX(element) &&
            (element.scrollLeft !== 0)
        ) {
            element.scroll({ left: 0, behavior: 'auto' });
            return false;
        }
    }

    return true;
}

/**
 * @summary Scroll to the rightmost of the specified element or upper-level HTMLElement if it is scrollable.
 * @param {HTMLElement} element - The element to scroll.
 * @returns {boolean} - True if no scrolling occurred, false if scrolling occurred.
 */
function scrollRightmostElement(element) {
    for (; element; element = element.parentNode) {
        if (canScrollX(element) &&
            (Math.abs(element.scrollWidth - element.clientWidth - element.scrollLeft) >= 1)
        ) {
            element.scroll({ left: element.scrollWidth, behavior: 'auto' });
            return false;
        }
    }

    return true;
}
