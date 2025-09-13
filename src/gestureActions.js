/**
 * @file gestureActions.js
 * @description Mouse gesture actions for the extension.
 */

/**
 * @import { sendChromeMessage, isInRootWindow, getRootWindow } from './utilities.js';
 */

/**
 * @typedef {object} ActionOption
 * @property {HTMLElement} target - The target element of the action.
 * @property {string} url - The href attribute of the target element.
 * @property {string} src - The src attribute of the target element.
 * @property {boolean} shouldPreventContextMenu - Indicates whether to prevent the context menu.
 */

/**
 * @typedef {Object} MouseGestureAction
 * @property {string} id - The ID of the action.
 * @property {function} function - The function to execute the action.
 */

/**
 * @typedef {Object} MouseGestureActionCategory
 * @property {string} id - The ID of the category.
 * @property {MouseGestureAction[]} actions - The list of actions in the category.
 */

/**
 * @summary Mouse gesture actions for the extension.
 * @type {MouseGestureActionCategory[]}
 */
const mouseGestureActionCategories = [
    {
        id: 'actionCategoryHistory',
        actions: [
            {
                id: 'back',
                function: () => {
                    if (isInRootWindow()) {
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
                }
            },
            {
                id: 'forward',
                function: () => {
                    if (isInRootWindow()) {
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
            },
        ]
    },
    {
        id: 'actionCategoryLink',
        actions: [
            {
                id: 'openlinkinnwetab',
                function: (option) => {
                    if (option.url) {
                        sendChromeMessage({ action: 'openlinkinnwetab', url: option.url });
                    }
                },
            },
            {
                id: 'openlinkinnwetabandactivate',
                function: (option) => {
                    if (option.url) {
                        sendChromeMessage({ action: 'openlinkinnwetabandactivate', url: option.url });
                    }
                },
            },
            {
                id: 'openlinkinnwewindow',
                function: (option) => {
                    if (option.url) {
                        sendChromeMessage({ action: 'openlinkinnwewindow', url: option.url });
                    }
                },
            },
            {
                id: 'openlinkinnwewindowandactivate',
                function: (option) => {
                    if (option.url) {
                        sendChromeMessage({ action: 'openlinkinnwewindowandactivate', url: option.url });
                    }
                },
            },
            {
                id: 'openlinkinnewtableftmost',
                function: (option) => {
                    if (option.url) {
                        sendChromeMessage({ action: 'openlinkinnewtableftmost', url: option.url });
                    }
                },
            },
            {
                id: 'openlinkinnewtableftmostandactivate',
                function: (option) => {
                    if (option.url) {
                        sendChromeMessage({ action: 'openlinkinnewtableftmostandactivate', url: option.url });
                    }
                },
            },
            {
                id: 'openlinkinnewtabrightmost',
                function: (option) => {
                    if (option.url) {
                        sendChromeMessage({ action: 'openlinkinnewtabrightmost', url: option.url });
                    }
                },
            },
            {
                id: 'openlinkinnewtabrightmostandactivate',
                function: (option) => {
                    if (option.url) {
                        sendChromeMessage({ action: 'openlinkinnewtabrightmostandactivate', url: option.url });
                    }
                },
            },
            {
                id: 'openimageinnewtab',
                function: (option) => {
                    if (option.src) {
                        sendChromeMessage({ action: 'openlinkinnwetab', url: option.src });
                    }
                },
            },
            {
                id: 'openimageinnewtabandactivate',
                function: (option) => {
                    if (option.src) {
                        sendChromeMessage({ action: 'openlinkinnwetabandactivate', url: option.src });
                    }
                },
            },
            {
                id: 'openimageinnewwindow',
                function: (option) => {
                    if (option.src) {
                        sendChromeMessage({ action: 'openlinkinnwewindow', url: option.src });
                    }
                },
            },
            {
                id: 'openimageinnewwindowandactivate',
                function: (option) => {
                    if (option.src) {
                        sendChromeMessage({ action: 'openlinkinnwewindowandactivate', url: option.src });
                    }
                },
            },
            {
                id: 'openimageinnewtableftmost',
                function: (option) => {
                    if (option.src) {
                        sendChromeMessage({ action: 'openimageinnewtableftmost', url: option.src });
                    }
                },
            },
            {
                id: 'openimageinnewtableftmostandactivate',
                function: (option) => {
                    if (option.src) {
                        sendChromeMessage({ action: 'openimageinnewtableftmostandactivate', url: option.src });
                    }
                },
            },
            {
                id: 'openimageinnewtabrightmost',
                function: (option) => {
                    if (option.src) {
                        sendChromeMessage({ action: 'openimageinnewtabrightmost', url: option.src });
                    }
                },
            },
            {
                id: 'openimageinnewtabrightmostandactivate',
                function: (option) => {
                    if (option.src) {
                        sendChromeMessage({ action: 'openimageinnewtabrightmostandactivate', url: option.src });
                    }
                },
            },
        ]
    },
    {
        id: 'actionCategoryTabOpenClose',
        actions: [
            {
                id: 'closetab',
                function: () => {
                    sendChromeMessage({ action: 'closetab' });
                },
            },
            {
                id: 'closetableftall',
                function: () => {
                    sendChromeMessage({ action: 'closetableftall' });
                },
            },
            {
                id: 'closetabrightall',
                function: () => {
                    sendChromeMessage({ action: 'closetabrightall' });
                },
            },
            {
                id: 'closetabotherall',
                function: () => {
                    sendChromeMessage({ action: 'closetabotherall' });
                },
            },
            {
                id: 'reopenclosedtab',
                function: () => {
                    sendChromeMessage({ action: 'reopenclosedtab' });
                },
            },
            {
                id: 'createtab',
                function: () => {
                    sendChromeMessage({ action: 'createtab' });
                },
            },
            {
                id: 'duplicatetab',
                function: () => {
                    sendChromeMessage({ action: 'duplicatetab' });
                },
            },
        ]
    },
    {
        id: 'actionCategoryTabManipulation',
        actions: [
            {
                id: 'pintab',
                function: () => {
                    sendChromeMessage({ action: 'pintab' });
                },
            },
            {
                id: 'addtabtogroup',
                function: () => {
                    sendChromeMessage({ action: 'addtabtogroup' });
                },
            },
            {
                id: 'removetabfromgroup',
                function: () => {
                    sendChromeMessage({ action: 'removetabfromgroup' });
                },
            },
            {
                id: 'mutetab',
                function: () => {
                    sendChromeMessage({ action: 'mutetab' });
                },
            },
            {
                id: 'unmutetab',
                function: () => {
                    sendChromeMessage({ action: 'unmutetab' });
                },
            },
            {
                id: 'mutetabtoggle',
                function: () => {
                    sendChromeMessage({ action: 'mutetabtoggle' });
                },
            },
            {
                id: 'mutetaball',
                function: () => {
                    sendChromeMessage({ action: 'mutetaball' });
                },
            },
            {
                id: 'unmutetaball',
                function: () => {
                    sendChromeMessage({ action: 'unmutetaball' });
                },
            },
            {
                id: 'zoomin',
                function: () => {
                    sendChromeMessage({ action: 'zoomin' });
                },
            },
            {
                id: 'zoomout',
                function: () => {
                    sendChromeMessage({ action: 'zoomout' });
                },
            },
            {
                id: 'zoomdefault',
                function: () => {
                    sendChromeMessage({ action: 'zoomdefault' });
                },
            },
        ]
    },
    {
        id: 'actionCategoryTabMove',
        actions: [
            {
                id: 'gotolefttab',
                function: (option) => {
                    sendChromeMessage({ action: 'gotolefttab', shouldPreventContextMenu: option.shouldPreventContextMenu });
                },
            },
            {
                id: 'gotorighttab',
                function: (option) => {
                    sendChromeMessage({ action: 'gotorighttab', shouldPreventContextMenu: option.shouldPreventContextMenu });
                },
            },
            {
                id: 'gotolefttabwithloop',
                function: (option) => {
                    sendChromeMessage({ action: 'gotolefttabwithloop', shouldPreventContextMenu: option.shouldPreventContextMenu });
                },
            },
            {
                id: 'gotorighttabwithloop',
                function: (option) => {
                    sendChromeMessage({ action: 'gotorighttabwithloop', shouldPreventContextMenu: option.shouldPreventContextMenu });
                },
            },
            {
                id: 'gotomostlefttab',
                function: (option) => {
                    sendChromeMessage({ action: 'gotomostlefttab', shouldPreventContextMenu: option.shouldPreventContextMenu });
                },
            },
            {
                id: 'gotomostrighttab',
                function: (option) => {
                    sendChromeMessage({ action: 'gotomostrighttab', shouldPreventContextMenu: option.shouldPreventContextMenu });
                },
            },
            {
                id: 'gotoprevioustab',
                function: (option) => {
                    sendChromeMessage({ action: 'gotoprevioustab', shouldPreventContextMenu: option.shouldPreventContextMenu });
                },
            },
            {
                id: 'gotoprevioustabloop',
                function: (option) => {
                    sendChromeMessage({ action: 'gotoprevioustabloop', shouldPreventContextMenu: option.shouldPreventContextMenu });
                },
            },
            {
                id: 'gotonexttab',
                function: (option) => {
                    sendChromeMessage({ action: 'gotonexttab', shouldPreventContextMenu: option.shouldPreventContextMenu });
                },
            },
            {
                id: 'gotonexttabloop',
                function: (option) => {
                    sendChromeMessage({ action: 'gotonexttabloop', shouldPreventContextMenu: option.shouldPreventContextMenu });
                },
            },
        ]
    },
    {
        id: 'actionCategoryReload',
        actions: [
            
            {
                id: 'reloadtab',
                function: () => {
                    sendChromeMessage({ action: 'reloadtab' });
                },
            },
            {
                id: 'reloadtabhard',
                function: () => {
                    sendChromeMessage({ action: 'reloadtabhard' });
                },
            },
            {
                id: 'reloadtaball',
                function: () => {
                    sendChromeMessage({ action: 'reloadtaball' });
                },
            },
        ]
    },
    {
        id: 'actionCategoryBookmark',
        actions: [
            {
                id: 'addbookmark',
                function: () => {
                    if (isInRootWindow()) {
                        sendChromeMessage({ action: 'addbookmark', bookmark: { title: document.title, url: document.location.href } });
                    }
                    else {
                        getRootWindow().postMessage({
                            extensionId: chrome.runtime.id,
                            type: 'execute-action',
                            action: 'addbookmark',
                            option: undefined,
                        },
                            '*');
                    }
                },
            },
            {
                id: 'upsertbookmark',
                function: () => {
                    if (isInRootWindow()) {
                        sendChromeMessage({ action: 'upsertbookmark', bookmark: { title: document.title, url: document.location.href } });
                    }
                    else {
                        getRootWindow().postMessage({
                            extensionId: chrome.runtime.id,
                            type: 'execute-action',
                            action: 'upsertbookmark',
                            option: undefined,
                        },
                            '*');
                    }
                },
            },
            {
                id: 'deletebookmark',
                function: () => {
                    if (isInRootWindow()) {
                        sendChromeMessage({ action: 'deletebookmark', bookmark: { url: document.location.href } });
                    }
                    else {
                        getRootWindow().postMessage({
                            extensionId: chrome.runtime.id,
                            type: 'execute-action',
                            action: 'deletebookmark',
                            option: undefined,
                        },
                            '*');
                    }
                },
            },
        ]
    },
    {
        id: 'actionCategoryScroll',
        actions: [
            {
                id: 'scrollup',
                function: (option) => {
                    if (isInRootWindow()) {
                        const element = option.target || document.documentElement;
                        if (scrollUpElement(element)) {
                            window.scrollBy({ top: -0.8 * window.innerHeight, behavior: 'auto' });
                        }
                    }
                    else {
                        if (scrollUpElement(option.target)) {
                            option.target = undefined;  // Remove live HTMLElement as it is not accessible from another window
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
            },
            {
                id: 'scrolldown',
                function: (option) => {
                    if (isInRootWindow()) {
                        const element = option.target || document.documentElement;
                        if (scrollDownElement(element)) {
                            window.scrollBy({ top: 0.8 * window.innerHeight, behavior: 'auto' });
                        }
                    }
                    else {
                        if (scrollDownElement(option.target)) {
                            option.target = undefined;  // Remove live HTMLElement as it is not accessible from another window
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
            },
            {
                id: 'scrollleft',
                function: (option) => {
                    if (isInRootWindow()) {
                        const element = option.target || document.documentElement;
                        if (scrollLeftElement(element)) {
                            window.scrollBy({ left: -0.8 * window.innerWidth, behavior: 'auto' });
                        }
                    }
                    else {
                        if (scrollLeftElement(option.target)) {
                            option.target = undefined;  // Remove live HTMLElement as it is not accessible from another window
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
            },
            {
                id: 'scrollright',
                function: (option) => {
                    if (isInRootWindow()) {
                        const element = option.target || document.documentElement;
                        if (scrollRightElement(element)) {
                            window.scrollBy({ left: 0.8 * window.innerWidth, behavior: 'auto' });
                        }
                    }
                    else {
                        if (scrollRightElement(option.target)) {
                            option.target = undefined;  // Remove live HTMLElement as it is not accessible from another window
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
            },
            {
                id: 'scrolltotop',
                function: (option) => {
                    if (isInRootWindow()) {
                        const element = option.target || document.documentElement;
                        if (scrollTopElement(element)) {
                            window.scroll({ top: 0, behavior: 'auto' });
                        }
                    }
                    else {
                        if (scrollTopElement(option.target)) {
                            option.target = undefined;  // Remove live HTMLElement as it is not accessible from another window
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
            },
            {
                id: 'scrolltobottom',
                function: (option) => {
                    if (isInRootWindow()) {
                        const element = option.target || document.documentElement;
                        if (scrollBottomElement(element)) {
                            window.scroll({ top: document.documentElement.scrollHeight, behavior: 'auto' });
                        }
                    }
                    else {
                        if (scrollBottomElement(option.target)) {
                            option.target = undefined;  // Remove live HTMLElement as it is not accessible from another window
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
            },
            {
                id: 'scrolltoleftmost',
                function: (option) => {
                    if (isInRootWindow()) {
                        const element = option.target || document.documentElement;
                        if (scrollLeftmostElement(element)) {
                            window.scroll({ left: 0, behavior: 'auto' });
                        }
                    }
                    else {
                        if (scrollLeftmostElement(option.target)) {
                            option.target = undefined;  // Remove live HTMLElement as it is not accessible from another window
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
            },
            {
                id: 'scrolltorightmost',
                function: (option) => {
                    if (isInRootWindow()) {
                        const element = option.target || document.documentElement;
                        if (scrollRightmostElement(element)) {
                            window.scroll({ left: document.documentElement.scrollWidth, behavior: 'auto' });
                        }
                    }
                    else {
                        if (scrollRightmostElement(option.target)) {
                            option.target = undefined;  // Remove live HTMLElement as it is not accessible from another window
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
            },
        ],
    },
    {
        id: 'actionCategoryWindow',
        actions: [
            {
                id: 'createwindow',
                function: () => {
                    sendChromeMessage({ action: 'createwindow' });
                },
            },
            {
                id: 'closewindow',
                function: () => {
                    sendChromeMessage({ action: 'closewindow' });
                },
            },
            {
                id: 'closewindowall',
                function: () => {
                    sendChromeMessage({ action: 'closewindowall' });
                },
            },
            {
                id: 'maximizewindow',
                function: () => {
                    sendChromeMessage({ action: 'maximizewindow' });
                },
            },
            {
                id: 'minimizewindow',
                function: () => {
                    sendChromeMessage({ action: 'minimizewindow' });
                },
            },
            {
                id: 'fullscreenwindow',
                function: () => {
                    sendChromeMessage({ action: 'fullscreenwindow' });
                },
            },
        ]
    },
    {
        id: 'actionCategoryMisc',
        actions: [
            {
                id: 'copyurl',
                function: () => {
                    if (isInRootWindow()) {
                        if (navigator.clipboard) {
                            navigator.clipboard.writeText(document.location.href).then(() => { });
                            alert(`${chrome.i18n.getMessage('messageCopied')}\n ${document.location.href}`);
                        }
                        else {
                            alert(chrome.i18n.getMessage('messageCopyError'));
                        }
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
            },
            {
                id: 'copytitle',
                function: () => {
                    if (isInRootWindow()) {
                        if (navigator.clipboard) {
                            navigator.clipboard.writeText(document.title).then(() => { });
                            alert(`${chrome.i18n.getMessage('messageCopied')}\n ${document.title}`);
                        }
                        else {
                            alert(chrome.i18n.getMessage('messageCopyError'));
                        }
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
            },
            {
                id: 'openoptionspage',
                function: () => {
                    sendChromeMessage({ action: 'openoptionspage' });
                },

            },
            {
                id: 'disableextension',
                function: () => {
                    window.postMessage({ extensionId: chrome.runtime.id, type: 'disable-mousegesture' }, '*');
                }
            }
        ]
    },
];

/**
 * @summary Execute the action based on the ID and options provided.
 * @param {string} id - The ID of the action.
 * @param {ActionOption} actionOption - The options for the action.
 */
function executeAction(id, actionOption) {
    if (id === '') {
        return;
    }

    const actions = mouseGestureActionCategories.map((category) => category.actions).reduce((previousValue, currentValue) => {
        return previousValue.concat(currentValue);
    });
    const action = actions.find((action) => action.id === id);
    if (action && action.function) {
        action.function(actionOption);
    }
    else {
        console.error(`Action with id ${id} not found.`);
    }
}

/**
 * @summary Get the list of mouse gesture action categories.
 * @returns {MouseGestureActionCategory[]} - The list of action categories.
 */
function getGestureActionCategories() {
    return mouseGestureActionCategories;
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
