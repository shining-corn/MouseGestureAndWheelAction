/**
 * @file service-worker.js
 * @description Service worker for the Chrome extension that handles various tab and window management actions.
 */

/**
 * @import { ExtensionOptions } from './ExtensionOptions.js';
 */

/**
 * @typedef {object} Tab - Represents a Chrome tab.
 * @property {number} id - The ID of the tab.
 * @property {number} index - The index of the tab in the window.
 * @property {number} windowId - The ID of the window the tab belongs to.
 * @property {boolean} pinned - Indicates if the tab is pinned.
 * @property {object} mutedInfo - Information about the tab's mute state.
 * @property {boolean} mutedInfo.muted - Indicates if the tab is muted.
 * @property {number} groupId - The ID of the group the tab belongs to.
 */

/**
 * @typedef {object} MessageSender - Represents the sender of a message of Chrome.
 */

/**
 * @typedef {object} TabActivateHistoryContainer
 * @property {number[]} history - The history of activated tab IDs.
 * @property {number} index - The current index in the history.
 * @property {boolean} shouldPreventAddHistory - Whether to prevent adding history.
 */

importScripts('./ExtensionOptions.js');

/**
 * @summary Send a message to specified tabs.
 * @param {any} request 
 * @param {Tab[]} tabs
 */
function sendMessageToTabs(request, tabs) {
    request.extensionId = chrome.runtime.id;
    for (let tab of tabs) {
        chrome.tabs.sendMessage(tab.id, request)
            .then(() => { }).catch(() => { });
    }
}

/**
 * @summary Go to a specific tab based on the current tab's ID and the distance to move.
 * @param {Tab[]} allTabs - All tabs in the current window.
 * @param {number} srcTabId - The ID of the source tab.
 * @param {number} distance - The distance to move (1 for right, -1 for left).
 * @param {boolean} isLoop - Whether to loop around when reaching the end of the tab list.
 * @param {boolean} shouldPreventContextMenu - Whether to prevent the context menu from appearing on the target tab.
 * @returns {boolean} - Returns true if the tab was successfully changed, false otherwise.
 */
function goToTab(allTabs, srcTabId, distance, isLoop, shouldPreventContextMenu) {
    allTabs.sort((a, b) => a.index - b.index);
    let i = allTabs.findIndex((tab) => tab.id === srcTabId);

    if (i === -1) {
        return false;
    }
    if (distance === -1 && i === 0) {
        if (isLoop) {
            i = allTabs.length;
        }
        else {
            return false;
        }
    }
    if (distance === 1 && i === allTabs.length - 1) {
        if (isLoop) {
            i = -1;
        }
        else {
            return false;
        }
    }

    let targetTab = allTabs[i + distance];
    chrome.tabs.update(targetTab.id, { active: true });
    if (shouldPreventContextMenu) {
        sendMessageToTabs({ type: 'prevent-contextmenu' }, [targetTab]);
    }

    return true;
}

/**
 * @summary Go to the most left tab in the current window.
 * @param {Tab[]} allTabs - All tabs in the current window.
 * @param {boolean} shouldPreventContextMenu - Whether to prevent the context menu from appearing on the target tab.
 * @returns {boolean} - Returns true if the tab was successfully changed, false otherwise.
 */
function goToMostLeftTab(allTabs, shouldPreventContextMenu) {
    allTabs.sort((a, b) => a.index - b.index);
    chrome.tabs.update(allTabs[0].id, { active: true });
    if (shouldPreventContextMenu) {
        sendMessageToTabs({ type: 'prevent-contextmenu' }, [allTabs[0]]);
    }

    return true;
}

/**
 * @summary Go to the most right tab in the current window.
 * @param {Tab[]} allTabs - All tabs in the current window.
 * @param {boolean} shouldPreventContextMenu - Whether to prevent the context menu from appearing on the target tab.
 * @returns {boolean} - Returns true if the tab was successfully changed, false otherwise.
 */
function goToMostRightTab(allTabs, shouldPreventContextMenu) {
    allTabs.sort((a, b) => b.index - a.index);
    chrome.tabs.update(allTabs[0].id, { active: true });
    if (shouldPreventContextMenu) {
        sendMessageToTabs({ type: 'prevent-contextmenu' }, [allTabs[0]]);
    }

    return true;
}

/**
 * @summary Class representing a mouse gesture service.
 */
class MouseGestureService {
    /**
     * @type {ExtensionOptions | undefined}
     */
    #options = undefined;

    /**
     * @type {windows.WindowState[]}
     */
    #previousWindowState = [];

    /**
     * @type {number | undefined}
     */
    #lastCreatedGroupId = undefined;

    /**
     * @type {TabActivateHistoryContainer[]}
     */
    #tabActivateHistoryContainer = {};

    /**
     * @constructor
     * @param {ExtensionOptions} options 
     */
    constructor(options) {
        this.#options = options;
    }

    /**
     * @summary Starts the mouse gesture service.
     */
    start() {
        this.processTabHistory();

        chrome.runtime.onMessage.addListener(
            (request, sender) => {
                if (!request || request.extensionId !== chrome.runtime.id) {
                    return;
                }

                switch (request.action) {
                    case 'createtab':
                        chrome.tabs.create({ active: true });
                        break;
                    case 'addtabtogroup':
                        (async () => {
                            const tab = await chrome.tabs.get(sender.tab.id);
                            if (this.#lastCreatedGroupId && tab.groupId === this.#lastCreatedGroupId) {
                                this.#lastCreatedGroupId = undefined;
                            }

                            this.#lastCreatedGroupId = await chrome.tabs.group({ groupId: this.#lastCreatedGroupId, tabIds: sender.tab.id, });

                        })();
                        break;
                    case 'removetabfromgroup':
                        (async () => {
                            chrome.tabs.ungroup(sender.tab.id);
                            if (this.#lastCreatedGroupId) {
                                const tabs = await chrome.tabs.query({ groupId: this.#lastCreatedGroupId });
                                if (tabs.length === 0) {
                                    this.#lastCreatedGroupId = undefined;
                                }
                            }
                        })();
                        break;
                    case 'duplicatetab':
                        chrome.tabs.duplicate(sender.tab.id);
                        break;
                    case 'pintab':
                        (async () => {
                            const tab = await chrome.tabs.get(sender.tab.id);
                            chrome.tabs.update(sender.tab.id, { pinned: !tab.pinned });
                        })();
                        break;
                    case 'closetab':
                        chrome.tabs.remove(sender.tab.id);
                        break;
                    case 'closetableftall':
                        (async () => {
                            const tabs = await chrome.tabs.query({ currentWindow: true });
                            const i = tabs.findIndex((element) => element.id === sender.tab.id);
                            if (i !== -1) {
                                for (const tab of tabs) {
                                    if (tab.pinned) {
                                        continue;
                                    }
                                    if (tab.index < tabs[i].index) {
                                        chrome.tabs.remove(tab.id);
                                    }
                                }
                            }
                        })();
                        break;
                    case 'closetabrightall':
                        (async () => {
                            const tabs = await chrome.tabs.query({ currentWindow: true });
                            const i = tabs.findIndex((element) => element.id === sender.tab.id);
                            if (i !== -1) {
                                for (const tab of tabs) {
                                    if (tab.pinned) {
                                        continue;
                                    }
                                    if (tab.index > tabs[i].index) {
                                        chrome.tabs.remove(tab.id);
                                    }
                                }
                            }
                        })();
                        break;
                    case 'closetabotherall':
                        (async () => {
                            const tabs = await chrome.tabs.query({ currentWindow: true });
                            const i = tabs.findIndex((element) => element.id === sender.tab.id);
                            if (i !== -1) {
                                for (const tab of tabs) {
                                    if (tab.pinned) {
                                        continue;
                                    }
                                    if (tab.index !== tabs[i].index) {
                                        chrome.tabs.remove(tab.id);
                                    }
                                }
                            }
                        })();
                        break;
                    case 'reopenclosedtab':
                        chrome.sessions.getRecentlyClosed((sessions) => {
                            (async () => {
                                if (sessions && sessions[0]) {
                                    await chrome.sessions.restore(sessions[0].tab ? sessions[0].tab.sessionId : sessions[0].window.sessionId);
                                }
                            })();
                        });
                        break;
                    case 'reloadtab':
                        chrome.tabs.reload(sender.tab.id);
                        break;
                    case 'reloadtabhard':
                        chrome.tabs.reload(sender.tab.id, { bypassCache: true });
                        break;
                    case 'reloadtaball':
                        (async () => {
                            const tabs = await chrome.tabs.query({ currentWindow: true });
                            for (const tab of tabs) {
                                chrome.tabs.reload(tab.id);
                            }
                        })();
                        break;
                    case 'gotolefttab':
                        (async () => {
                            const tabs = await chrome.tabs.query({ currentWindow: true });
                            goToTab(tabs, sender.tab.id, -1, false, request.shouldPreventContextMenu);
                        })();
                        break;
                    case 'gotorighttab':
                        (async () => {
                            const tabs = await chrome.tabs.query({ currentWindow: true });
                            goToTab(tabs, sender.tab.id, 1, false, request.shouldPreventContextMenu);
                        })();
                        break;
                    case 'gotolefttabwithloop':
                        (async () => {
                            const tabs = await chrome.tabs.query({ currentWindow: true });
                            goToTab(tabs, sender.tab.id, -1, true, request.byshouldPreventContextMenuwheel);
                        })();
                        break;
                    case 'gotorighttabwithloop':
                        (async () => {
                            const tabs = await chrome.tabs.query({ currentWindow: true });
                            goToTab(tabs, sender.tab.id, 1, true, request.shouldPreventContextMenu);
                        })();
                        break;
                    case 'gotomostlefttab':
                        (async () => {
                            const tabs = await chrome.tabs.query({ currentWindow: true });
                            goToMostLeftTab(tabs, request.shouldPreventContextMenu);
                        })();
                        break;
                    case 'gotomostrighttab':
                        (async () => {
                            const tabs = await chrome.tabs.query({ currentWindow: true });
                            goToMostRightTab(tabs, request.shouldPreventContextMenu);
                        })();
                        break;
                    case 'gotoprevioustab':
                        this.goToPreviousTab(sender, false, request.shouldPreventContextMenu);
                        break;
                    case 'gotoprevioustabloop':
                        this.goToPreviousTab(sender, true, request.shouldPreventContextMenu);
                        break;
                    case 'gotonexttab':
                        this.goToNextTab(sender, false, request.shouldPreventContextMenu);
                        break;
                    case 'gotonexttabloop':
                        this.goToNextTab(sender, true, request.shouldPreventContextMenu);
                        break;
                    case 'openoptionspage':
                        chrome.runtime.openOptionsPage();
                        break;
                    case 'addbookmark':
                        chrome.bookmarks.search({ url: request.bookmark.url }, (result) => {
                            if (result.length === 0) {
                                request.bookmark.parentId = "1";
                                chrome.bookmarks.create(request.bookmark);
                            }
                        });
                        break;
                    case 'upsertbookmark':
                        (async () => {
                            let existsBookmark = true;

                            const existingBookmarks = await chrome.bookmarks.search({ url: request.bookmark.url });
                            if (existingBookmarks.length === 0) {
                                const data = await chrome.storage.local.get(['defaultBookmarkFolder']);
                                if (data && data.defaultBookmarkFolder) {
                                    request.bookmark.parentId = data.defaultBookmarkFolder;
                                }
                                else {
                                    request.bookmark.parentId = "1";
                                }
                                chrome.bookmarks.create(request.bookmark);

                                existsBookmark = false;
                            }

                            const tree = await chrome.bookmarks.getTree();
                            sendMessageToTabs({ type: 'upsertbookmarkresponse', bookmarks: tree, existsBookmark: existsBookmark }, [sender.tab]);
                        })();
                        break;
                    case 'editbookmark':
                        (async () => {
                            let existingBookmark = undefined;
                            if (request.bookmark.id) {
                                try {
                                    existingBookmark = await chrome.bookmarks.get(request.bookmark.id);
                                    if (existingBookmark) {
                                        existingBookmark = existingBookmark[0];
                                    }
                                }
                                catch (_) {
                                    // DO NOTHING
                                }
                            }

                            if (existingBookmark) {
                                if (existingBookmark.parentId === request.bookmark.parentId) {
                                    await chrome.bookmarks.update(request.bookmark.id, { title: request.bookmark.title, url: request.bookmark.url });
                                }
                                else {
                                    await chrome.bookmarks.remove(request.bookmark.id);
                                    await chrome.bookmarks.create({ title: request.bookmark.title, url: request.bookmark.url, parentId: request.bookmark.parentId });
                                }
                            }
                            else {
                                await chrome.bookmarks.create({ title: request.bookmark.title, url: request.bookmark.url, parentId: request.bookmark.parentId });
                            }
                        })();
                        break;
                    case 'deletebookmark':
                        chrome.bookmarks.search({ url: request.bookmark.url }, (result) => {
                            for (const bookmark of result) {
                                chrome.bookmarks.remove(bookmark.id);
                            }
                        });
                        break;
                    case 'createwindow':
                        (async () => {
                            await chrome.windows.create();
                        })();
                        break;
                    case 'closewindow':
                        {
                            const window = chrome.windows.getCurrent();
                            window.then((w) => {
                                (async () => {
                                    await chrome.windows.remove(w.id);
                                })();
                            });
                        }
                        break;
                    case 'closewindowall':
                        {
                            const window = chrome.windows.getAll();
                            window.then((ws) => {
                                for (const w of ws) {
                                    (async () => {
                                        await chrome.windows.remove(w.id);
                                    })();
                                }
                            });
                        }
                        break;
                    case 'maximizewindow':
                        {
                            const window = chrome.windows.getCurrent();
                            window.then((w) => {
                                (async () => {
                                    if (w.state !== 'maximized') {
                                        this.#previousWindowState[w.id] = w.state;
                                        await chrome.windows.update(w.id, { state: 'maximized' });
                                    }
                                    else {
                                        if (this.#previousWindowState[w.id]) {
                                            await chrome.windows.update(w.id, { state: this.#previousWindowState[w.id] });
                                        }
                                        else {
                                            await chrome.windows.update(w.id, { state: 'normal' });
                                        }
                                    }
                                })();
                            });
                        }
                        break;
                    case 'minimizewindow':
                        {
                            const window = chrome.windows.getCurrent();
                            window.then((w) => {
                                (async () => {
                                    await chrome.windows.update(w.id, { state: 'minimized' });
                                })();
                            });
                        }
                        break;
                    case 'fullscreenwindow':
                        {
                            const window = chrome.windows.getCurrent();
                            window.then((w) => {
                                (async () => {
                                    if (w.state !== 'fullscreen') {
                                        this.#previousWindowState[w.id] = w.state;
                                        await chrome.windows.update(w.id, { state: 'fullscreen' });
                                    }
                                    else {
                                        if (this.#previousWindowState[w.id]) {
                                            await chrome.windows.update(w.id, { state: this.#previousWindowState[w.id] });
                                        }
                                        else {
                                            await chrome.windows.update(w.id, { state: 'maximized' });
                                        }
                                    }
                                })();
                            });
                        }
                        break;
                    case 'writetoclipboard':
                        navigator.clipboard.writeText(request.text).then(() => { });
                        break;
                    case 'mutetab':
                        chrome.tabs.update(sender.tab.id, { muted: true });
                        break;
                    case 'unmutetab':
                        chrome.tabs.update(sender.tab.id, { muted: false });
                        break;
                    case 'mutetaball':
                        (async () => {
                            const tabs = await chrome.tabs.query({});
                            for (const tab of tabs) {
                                chrome.tabs.update(tab.id, { muted: true });
                            }
                        })();
                        break;
                    case 'unmutetaball':
                        (async () => {
                            const tabs = await chrome.tabs.query({});
                            for (const tab of tabs) {
                                chrome.tabs.update(tab.id, { muted: false });
                            }
                        })();
                        break;
                    case 'mutetabtoggle':
                        chrome.tabs.update(sender.tab.id, { muted: !sender.tab.mutedInfo.muted });
                        break;
                    case 'zoomin':
                        (async () => {
                            const zoom = (await chrome.tabs.getZoom()) + 0.25;
                            chrome.tabs.setZoom(zoom >= 5 ? 5 : zoom);
                        })();
                        break;
                    case 'zoomout':
                        (async () => {
                            const zoom = (await chrome.tabs.getZoom()) - 0.25;
                            chrome.tabs.setZoom(zoom <= 0 ? 0.25 : zoom);
                        })();
                        break;
                    case 'zoomdefault':
                        (async () => {
                            const zoom = (await chrome.tabs.getZoomSettings());
                            chrome.tabs.setZoom(zoom.defaultZoomFactor);
                        })();
                        break;
                    case 'openlinkinnwetab':
                        (async () => {
                            chrome.tabs.create({
                                url: request.url,
                                active: false,
                                index: sender.tab.index + 1
                            });
                        })();
                        break;
                    case 'openlinkinnwetabandactivate':
                        (async () => {
                            chrome.tabs.create({
                                url: request.url,
                                active: true,
                                index: sender.tab.index + 1
                            });
                        })();
                        break;
                    case 'openlinkinnwewindow':
                        (async () => {
                            await chrome.windows.create({
                                url: request.url,
                                focused: false
                            });
                        })();
                        break;
                    case 'openlinkinnwewindowandactivate':
                        (async () => {
                            await chrome.windows.create({
                                url: request.url,
                                focused: true
                            });
                        })();
                        break;
                    default:
                        console.log('Unexpected request:', request);
                        break;
                }
            }
        );
    }

    /**
     * @summary Processes tab activation history to manage tab switching.
     */
    processTabHistory() {
        chrome.tabs.onActivated.addListener((activeInfo) => {
            if (!this.#tabActivateHistoryContainer[activeInfo.windowId]) {
                this.#tabActivateHistoryContainer[activeInfo.windowId] = {
                    history: [],
                    index: -1,
                    shouldPreventAddHistory: false,
                };
            }

            const container = this.#tabActivateHistoryContainer[activeInfo.windowId];
            if (container.shouldPreventAddHistory) {
                container.shouldPreventAddHistory = false;
            }
            else if ((container.history.length === 0) || (container.history[container.history.length - 1] !== activeInfo.tabId)) {
                container.history.push(activeInfo.tabId);
                container.index = -1;

                // Remove the oldest history if it exceeds the limit
                const historySize = this.#options.previousTabHistorySize;
                container.history.splice(0, container.history.length - historySize);
            }
        });

        chrome.tabs.onDetached.addListener((tabId, detachInfo) => {
            if (this.#tabActivateHistoryContainer[detachInfo.oldWindowId]) {
                this.#tabActivateHistoryContainer[detachInfo.oldWindowId].history = this.#tabActivateHistoryContainer[detachInfo.oldWindowId].history.filter((elem) => elem !== tabId);

                this.#tabActivateHistoryContainer[detachInfo.oldWindowId].history = this.#tabActivateHistoryContainer[detachInfo.oldWindowId].history.filter((elem, i, array) => i === 0 || elem !== array[i - 1]);

                if (this.#tabActivateHistoryContainer[detachInfo.oldWindowId].history.length === 0) {
                    delete this.#tabActivateHistoryContainer[detachInfo.oldWindowId];
                }
            }
        });

        chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
            if (removeInfo.isWindowClosing) {
                delete this.#tabActivateHistoryContainer[removeInfo.windowId];
            }
            else if (this.#tabActivateHistoryContainer[removeInfo.windowId]) {
                this.#tabActivateHistoryContainer[removeInfo.windowId].history = this.#tabActivateHistoryContainer[removeInfo.windowId].history.filter((elem) => elem !== tabId);

                this.#tabActivateHistoryContainer[removeInfo.windowId].history = this.#tabActivateHistoryContainer[removeInfo.windowId].history.filter((elem, i, array) => i === 0 || elem !== array[i - 1]);
                if (this.#tabActivateHistoryContainer[removeInfo.windowId].history.length === 0) {
                    delete this.#tabActivateHistoryContainer[removeInfo.windowId];
                }
            }
        });
    }

    /**
     * @summary Goes to the previous tab in the history.
     * @param {MessageSender} sender 
     * @param {boolean} shouldLoop - Whether to loop back to the last tab if there are no more tabs in the history.
     * @param {boolean} shouldPreventContextMenu - Whether to prevent the context menu from appearing on the target tab.
     */
    goToPreviousTab(sender, shouldLoop, shouldPreventContextMenu) {
        const container = this.#tabActivateHistoryContainer[sender.tab.windowId];
        if (container && container.history.length > 0) {
            if (container.index === -1) {
                container.index = container.history.length - 1;
            }

            container.index--;
            if (container.index < 0) {
                if (shouldLoop) {
                    container.index = container.history.length - 1;
                }
                else {
                    container.index = 0;
                }
            }

            if (sender.tab.id !== container.history[container.index]) {
                if (shouldPreventContextMenu) {
                    sendMessageToTabs({ type: 'prevent-contextmenu' }, [{ id: container.history[container.index] }]);
                }
                chrome.tabs.update(container.history[container.index], { active: true });
                container.shouldPreventAddHistory = true;
            }
        }
    }

    /**
     * @summary Goes to the next tab in the history.
     * @param {MessageSender} sender 
     * @param {boolean} shouldLoop - Whether to loop back to the last tab if there are no more tabs in the history.
     * @param {boolean} shouldPreventContextMenu - Whether to prevent the context menu from appearing on the target tab.
     */
    goToNextTab(sender, shouldLoop, shouldPreventContextMenu) {
        const container = this.#tabActivateHistoryContainer[sender.tab.windowId];
        if (container && container.history.length > 0) {
            if (container.index === -1) {
                container.index = container.history.length - 1;
            }

            container.index++;
            if (container.index >= container.history.length) {
                if (shouldLoop) {
                    container.index = 0;
                }
                else {
                    container.index = container.history.length - 1;
                }
            }

            if (sender.tab.id !== container.history[container.index]) {
                if (shouldPreventContextMenu) {
                    sendMessageToTabs({ type: 'prevent-contextmenu' }, [{ id: container.history[container.index] }]);
                }
                chrome.tabs.update(container.history[container.index], { active: true });
                container.shouldPreventAddHistory = true;
            }
        }
    }
}

(() => {
    chrome.runtime.onInstalled.addListener((details) => {
        if (details.reason === 'install') {
            chrome.runtime.openOptionsPage();
        }
    });

    let options = new ExtensionOptions();
    (async () => { await options.loadFromStrageLocal(); })();
    (new MouseGestureService(options)).start(); // If execute this in the async function, it rarely causes an error "Could not establish connection. Receiving end does not exist." in `chrome.runtime.sendMessage()` in content.js, so execute it in the immediate function.
})();
