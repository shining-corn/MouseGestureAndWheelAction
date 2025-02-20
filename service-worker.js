function sendMessageToTabs(request, tabs) {
    request.extensionId = chrome.runtime.id;
    for (let tab of tabs) {
        chrome.tabs.sendMessage(tab.id, request)
            .then(() => { }).catch(() => { });
    }
}

function activateTab(allTabs, srcTabId, delta, loop, shouldPreventContextMenu) {
    allTabs.sort((a, b) => a.index - b.index);
    let i = allTabs.findIndex((tab) => tab.id === srcTabId);

    if (i === -1) {
        if (shouldPreventContextMenu) {
            sendMessageToTabs({ type: 'prevent-contextmenu' }, [{ id: srcTabId }]);
        }
        return false;
    }
    if (delta === -1 && i === 0) {
        if (loop) {
            i = allTabs.length;
        }
        else {
            if (shouldPreventContextMenu) {
                sendMessageToTabs({ type: 'prevent-contextmenu' }, [{ id: srcTabId }]);
            }
            return false;
        }
    }
    if (delta === 1 && i === allTabs.length - 1) {
        if (loop) {
            i = -1;
        }
        else {
            if (shouldPreventContextMenu) {
                sendMessageToTabs({ type: 'prevent-contextmenu' }, [{ id: srcTabId }]);
            }
            return false;
        }
    }

    let targetTab = allTabs[i + delta];
    chrome.tabs.update(targetTab.id, { active: true });
    if (shouldPreventContextMenu) {
        sendMessageToTabs({ type: 'prevent-contextmenu' }, [targetTab]);
    }

    return true;
}

function activateMostLeftTab(allTabs, shouldPreventContextMenu) {
    allTabs.sort((a, b) => a.index - b.index);
    chrome.tabs.update(allTabs[0].id, { active: true });
    if (shouldPreventContextMenu) {
        sendMessageToTabs({ type: 'prevent-contextmenu' }, [allTabs[0]]);
    }

    return true;
}

function activateMostRightTab(allTabs, shouldPreventContextMenu) {
    allTabs.sort((a, b) => b.index - a.index);
    chrome.tabs.update(allTabs[0].id, { active: true });
    if (shouldPreventContextMenu) {
        sendMessageToTabs({ type: 'prevent-contextmenu' }, [allTabs[0]]);
    }

    return true;
}

class MouseGestureService {
    constructor() {
        this.previousWindowState = [];
        this.lastCreatedGroupId = undefined;
        this.tabActivateHistory = {};
    }

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
                            if (this.lastCreatedGroupId && tab.groupId === this.lastCreatedGroupId) {
                                this.lastCreatedGroupId = undefined;
                            }

                            this.lastCreatedGroupId = await chrome.tabs.group({ groupId: this.lastCreatedGroupId, tabIds: sender.tab.id, });

                        })();
                        break;
                    case 'removetabfromgroup':
                        chrome.tabs.ungroup(sender.tab.id);
                        if (this.lastCreatedGroupId) {
                            chrome.tabs.query({ groupId: this.lastCreatedGroupId }).then(
                                (result) => {
                                    if (result.length === 0) {
                                        this.lastCreatedGroupId = undefined;
                                    }
                                }
                            );
                        }
                        break;
                    case 'duplicatetab':
                        chrome.tabs.duplicate(sender.tab.id);
                        break;
                    case 'closetab':
                        chrome.tabs.remove(sender.tab.id);
                        break;
                    case 'closetableftall':
                        (async () => {
                            const allTabs = await chrome.tabs.query({ currentWindow: true });
                            const i = allTabs.findIndex((element) => element.id === sender.tab.id);
                            if (i !== -1) {
                                for (const tab of allTabs) {
                                    if (tab.index < allTabs[i].index) {
                                        chrome.tabs.remove(tab.id);
                                    }
                                }
                            }
                        })();
                        break;
                    case 'closetabrightall':
                        (async () => {
                            const allTabs = await chrome.tabs.query({ currentWindow: true });
                            const i = allTabs.findIndex((element) => element.id === sender.tab.id);
                            if (i !== -1) {
                                for (const tab of allTabs) {
                                    if (tab.index > allTabs[i].index) {
                                        chrome.tabs.remove(tab.id);
                                    }
                                }
                            }
                        })();
                        break;
                    case 'closetabotherall':
                        (async () => {
                            const allTabs = await chrome.tabs.query({ currentWindow: true });
                            const i = allTabs.findIndex((element) => element.id === sender.tab.id);
                            if (i !== -1) {
                                for (const tab of allTabs) {
                                    if (tab.index !== allTabs[i].index) {
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
                            const allTabs = await chrome.tabs.query({ currentWindow: true });
                            for (const tab of allTabs) {
                                chrome.tabs.reload(tab.id);
                            }
                        })();
                        break;
                    case 'gotolefttab':
                        (async () => {
                            const allTabs = await chrome.tabs.query({ currentWindow: true });
                            activateTab(allTabs, sender.tab.id, -1, false, request.shouldPreventContextMenu);
                        })();
                        break;
                    case 'gotorighttab':
                        (async () => {
                            const allTabs = await chrome.tabs.query({ currentWindow: true });
                            activateTab(allTabs, sender.tab.id, 1, false, request.shouldPreventContextMenu);
                        })();
                        break;
                    case 'gotolefttabwithloop':
                        (async () => {
                            const allTabs = await chrome.tabs.query({ currentWindow: true });
                            activateTab(allTabs, sender.tab.id, -1, true, request.byshouldPreventContextMenuwheel);
                        })();
                        break;
                    case 'gotorighttabwithloop':
                        (async () => {
                            const allTabs = await chrome.tabs.query({ currentWindow: true });
                            activateTab(allTabs, sender.tab.id, 1, true, request.shouldPreventContextMenu);
                        })();
                        break;
                    case 'gotomostlefttab':
                        (async () => {
                            const allTabs = await chrome.tabs.query({ currentWindow: true });
                            activateMostLeftTab(allTabs, request.shouldPreventContextMenu);
                        })();
                        break;
                    case 'gotomostrighttab':
                        (async () => {
                            const allTabs = await chrome.tabs.query({ currentWindow: true });
                            activateMostRightTab(allTabs, request.shouldPreventContextMenu);
                        })();
                        break;
                    case 'gotoprevioustab':
                        {
                            const data = this.tabActivateHistory[sender.tab.windowId];
                            if (data && data.history.length > 0) {
                                if (data.index === -1) {
                                    data.index = data.history.length - 1;
                                }

                                if (data.index !== 0) {
                                    data.index--;
                                }

                                if (sender.tab.id !== data.history[data.index]) {
                                    chrome.tabs.update(data.history[data.index], { active: true });
                                    data.shouldPreventAddHistory = true;
                                    sendMessageToTabs({ type: 'prevent-contextmenu' }, [{ id: data.history[data.index] }]);
                                }
                                else {
                                    sendMessageToTabs({ type: 'prevent-contextmenu' }, [{ id: sender.tab.id }]);
                                }
                            }
                            else {
                                sendMessageToTabs({ type: 'prevent-contextmenu' }, [{ id: sender.tab.id }]);
                            }
                        }
                        break;
                    case 'gotonexttab':
                        {
                            const data = this.tabActivateHistory[sender.tab.windowId];
                            if (data && data.history.length > 0) {
                                if (data.index === -1) {
                                    data.index = data.history.length - 1;
                                }

                                if (data.index < data.history.length - 1) {
                                    data.index++;
                                }

                                if (sender.tab.id !== data.history[data.index]) {
                                    chrome.tabs.update(data.history[data.index], { active: true });
                                    data.shouldPreventAddHistory = true;
                                }
                                else {
                                    sendMessageToTabs({ type: 'prevent-contextmenu' }, [{ id: sender.tab.id }]);
                                }
                            }
                            else {
                                sendMessageToTabs({ type: 'prevent-contextmenu' }, [{ id: sender.tab.id }]);
                            }
                        }
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
                                        this.previousWindowState[w.id] = w.state;
                                        await chrome.windows.update(w.id, { state: 'maximized' });
                                    }
                                    else {
                                        if (this.previousWindowState[w.id]) {
                                            await chrome.windows.update(w.id, { state: this.previousWindowState[w.id] });
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
                                        this.previousWindowState[w.id] = w.state;
                                        await chrome.windows.update(w.id, { state: 'fullscreen' });
                                    }
                                    else {
                                        if (this.previousWindowState[w.id]) {
                                            await chrome.windows.update(w.id, { state: this.previousWindowState[w.id] });
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
                            const allTabs = await chrome.tabs.query({});
                            for (const tab of allTabs) {
                                chrome.tabs.update(tab.id, { muted: true });
                            }
                        })();
                        break;
                    case 'unmutetaball':
                        (async () => {
                            const allTabs = await chrome.tabs.query({});
                            for (const tab of allTabs) {
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

    processTabHistory() {
        chrome.tabs.onActivated.addListener((activeInfo) => {
            if (!this.tabActivateHistory[activeInfo.windowId]) {
                this.tabActivateHistory[activeInfo.windowId] = {
                    history: [],
                    index: -1,
                    shouldPreventAddHistory: false,
                };
            }

            const data = this.tabActivateHistory[activeInfo.windowId];
            if (data.shouldPreventAddHistory) {
                data.shouldPreventAddHistory = false;
            }
            else if ((data.history.length === 0) || (data.history[data.history.length - 1] !== activeInfo.tabId)) {
                while (data.length >= 4096) {    // 4096: max history length
                    this.tabActivateHistory[activeInfo.windowId].history.shift();
                }
                this.tabActivateHistory[activeInfo.windowId].history.push(activeInfo.tabId);

                data.index = -1;
            }
        });

        chrome.tabs.onDetached.addListener((tabId, detachInfo) => {
            if (this.tabActivateHistory[detachInfo.oldWindowId]) {
                this.tabActivateHistory[detachInfo.oldWindowId].history = this.tabActivateHistory[detachInfo.oldWindowId].history.filter((elem) => elem !== tabId);

                this.tabActivateHistory[detachInfo.oldWindowId].history = this.tabActivateHistory[detachInfo.oldWindowId].history.filter((elem, i, array) => i === 0 || elem !== array[i - 1]);

                if (this.tabActivateHistory[detachInfo.oldWindowId].history.length === 0) {
                    delete this.tabActivateHistory[detachInfo.oldWindowId];
                }
            }
        });

        chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
            if (removeInfo.isWindowClosing) {
                delete this.tabActivateHistory[removeInfo.windowId];
            }
            else if (this.tabActivateHistory[removeInfo.windowId]) {
                this.tabActivateHistory[removeInfo.windowId].history = this.tabActivateHistory[removeInfo.windowId].history.filter((elem) => elem !== tabId);

                this.tabActivateHistory[detachInfo.oldWindowId].history = this.tabActivateHistory[detachInfo.oldWindowId].history.filter((elem, i, array) => i === 0 || elem !== array[i - 1]);

                if (this.tabActivateHistory[removeInfo.windowId].history.length === 0) {
                    delete this.tabActivateHistory[removeInfo.windowId];
                }
            }
        });
    }
}

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        chrome.runtime.openOptionsPage();
    }
});
(new MouseGestureService()).start();
