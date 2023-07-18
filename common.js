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
    const THRESHOLD = Math.PI / 8;
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

function getGestureActions() {
    return {
        back: () => {
            window.history.go(-1);
        },
        forward: () => {
            window.history.go(1);
        },
        scrollup: () => {
            window.scrollBy({ top: -0.9 * window.innerHeight, behavior: 'auto' });
        },
        scrolldown: () => {
            window.scrollBy({ top: 0.9 * window.innerHeight, behavior: 'auto' });
        },
        scrollleft: () => {
            window.scrollBy({ left: -0.9 * window.innerWidth, behavior: 'auto' });
        },
        scrollright: () => {
            window.scrollBy({ left: 0.9 * window.innerWidth, behavior: 'auto' });
        },
        scrolltotop: () => {
            window.scroll({ top: 0, behavior: 'auto' });
        },
        scrolltobottom: () => {
            const element = document.documentElement;
            window.scroll({ top: element.scrollHeight, behavior: 'auto' });
        },
        createtab: () => {
            sendMessage({ action: 'createtab' });
        },
        duplicatetab: () => {
            sendMessage({ action: 'duplicatetab' });
        },
        closetab: () => {
            sendMessage({ action: 'closetab' });
        },
        closetableftall: () => {
            sendMessage({ action: 'closetableftall' });
        },
        closetabrightall: () => {
            sendMessage({ action: 'closetabrightall' });
        },
        closetabotherall: () => {
            sendMessage({ action: 'closetabotherall' });
        },
        reopenclosedtab: () => {
            sendMessage({ action: 'reopenclosedtab' });
        },
        reloadtab: () => {
            sendMessage({ action: 'reloadtab' });
        },
        reloadtabhard: () => {
            sendMessage({ action: 'reloadtabhard' });
        },
        gotolefttab: (bywheel) => {
            sendMessage({ action: 'gotolefttab', bywheel: bywheel });
        },
        gotorighttab: (bywheel) => {
            sendMessage({ action: 'gotorighttab', bywheel: bywheel });
        },
        gotolefttabwithloop: (bywheel) => {
            sendMessage({ action: 'gotolefttabwithloop', bywheel: bywheel });
        },
        gotorighttabwithloop: (bywheel) => {
            sendMessage({ action: 'gotorighttabwithloop', bywheel: bywheel });
        },
        gotomostlefttab: (bywheel) => {
            sendMessage({ action: 'gotomostlefttab', bywheel: bywheel });
        },
        gotomostrighttab: (bywheel) => {
            sendMessage({ action: 'gotomostrighttab', bywheel: bywheel });
        },
        openoptionspage: () => {
            sendMessage({ action: 'openoptionspage' });
        },
        addbookmark: () => {
            sendMessage({ action: 'addbookmark', bookmark: { title: document.title, url: document.location.href } });
        },
        upsertbookmark: () => {
            sendMessage({ action: 'upsertbookmark', bookmark: { title: document.title, url: document.location.href } });
        },
        deletebookmark: () => {
            sendMessage({ action: 'deletebookmark', bookmark: { url: document.location.href } });
        },
        createwindow: () => {
            sendMessage({ action: 'createwindow' });
        },
        closewindow: () => {
            sendMessage({ action: 'closewindow' });
        },
        closewindowall: () => {
            sendMessage({ action: 'closewindowall' });
        },
        maximizewindow: () => {
            sendMessage({ action: 'maximizewindow' });
        },
        minimizewindow: () => {
            sendMessage({ action: 'minimizewindow' });
        },
        fullscreenwindow: () => {
            sendMessage({ action: 'fullscreenwindow' });
        },
        copyurl: () => {
            navigator.clipboard.writeText(document.location.href).then(() => { });
            alert(`${chrome.i18n.getMessage('messageCopied')}\n ${document.location.href}`);
        },
        copytitle: () => {
            navigator.clipboard.writeText(document.title).then(() => { });
            alert(`${chrome.i18n.getMessage('messageCopied')}\n ${document.title}`);
        },
        mutetab: () => {
            sendMessage({ action: 'mutetab' });
        },
        unmutetab: () => {
            sendMessage({ action: 'unmutetab' });
        },
        mutetabtoggle: () => {
            sendMessage({ action: 'mutetabtoggle' });
        },
        mutetaball: () => {
            sendMessage({ action: 'mutetaball' });
        },
        unmutetaball: () => {
            sendMessage({ action: 'unmutetaball' });
        },
        zoomin: () => {
            sendMessage({ action: 'zoomin' });
        },
        zoomout: () => {
            sendMessage({ action: 'zoomout' });
        },
        zoomdefault: () => {
            sendMessage({ action: 'zoomdefault' });
        },
        disableextension: () => {
            window.postMessage({ extensionId: chrome.runtime.id, type: 'disable-mousegesture' }, '*');
        }
    };
}

class ExtensionOption {
    constructor() {
        this.options = {};

        chrome.storage.local.onChanged.addListener((event) => {
            if (event.options && event.options.newValue) {
                this.options = event.options.newValue;
            }
        })
    }

    async loadFromStrageLocal() {
        const result = await chrome.storage.local.get(['options']);
        if (result.options) {
            this.options = result.options;
        }
        else {
            this.options = {
                enabledWheelAction: true,
                enabledMouseGesture: true,
                rightButtonAndWheelUp: 'gotolefttab',
                rightButtonAndWheelDown: 'gotorighttab',
                gestureSettings: [
                    { gesture: '←', action: 'back' },
                    { gesture: '→', action: 'forward' },
                    { gesture: '↑', action: 'scrollup' },
                    { gesture: '↓', action: 'scrolldown' },
                    { gesture: '→↑', action: 'scrolltotop' },
                    { gesture: '→↓', action: 'scrolltobottom' },
                    { gesture: '↓→', action: 'closetab' },
                    { gesture: '↓←', action: 'reopenclosedtab' },
                    { gesture: '↑↓', action: 'reloadtab' },
                    { gesture: '↑↓↑', action: 'reloadtabhard' },
                    { gesture: '↑←', action: 'gotolefttabwithloop' },
                    { gesture: '↑→', action: 'gotorighttabwithloop' },
                    { gesture: '↑←↓', action: 'gotomostlefttab' },
                    { gesture: '↑→↓', action: 'gotomostrighttab' },
                    { gesture: '←↑', action: 'upsertbookmark' },
                    { gesture: '←↓', action: 'deletebookmark' },
                    { gesture: '←→', action: 'mutetabtoggle' }
                ]
            };
            await chrome.storage.local.set({ options: this.options });
        }
    }

    get enabledWheelAction() {
        return this.options.enabledWheelAction;
    }

    get enabledMouseGesture() {
        return this.options.enabledMouseGesture;
    }

    get rightButtonAndWheelUp() {
        return this.options.rightButtonAndWheelUp;
    }

    get rightButtonAndWheelDown() {
        return this.options.rightButtonAndWheelDown;
    }

    get gestureSettings() {
        return this.options.gestureSettings;
    }

    getGestureAction(gesture) {
        const i = this.options.gestureSettings.findIndex(elem => elem.gesture.toString() === gesture);
        if (i !== -1) {
            return this.options.gestureSettings[i].action;
        }
        return undefined;
    }

    async changeEnabledWheelAction(enabled) {
        this.options.enabledWheelAction = enabled;
        await chrome.storage.local.set({ 'options': this.options });
    }

    async changeEnabledMouseGesture(enabled) {
        this.options.enabledMouseGesture = enabled;
        await chrome.storage.local.set({ 'options': this.options });
    }

    async changeRightClickWheelUpAction(action) {
        this.options.rightButtonAndWheelUp = action;
        await chrome.storage.local.set({ 'options': this.options });
    }

    async changeRightClickWheelDownAction(action) {
        this.options.rightButtonAndWheelDown = action;
        await chrome.storage.local.set({ 'options': this.options });
    }

    async upsertGesture(gesture, action) {
        const newGesture = {
            gesture: gesture,
            action: action
        };
        const i = this.options.gestureSettings.findIndex(elem => elem.gesture.toString() === gesture);
        if (i !== -1) {
            this.options.gestureSettings[i] = newGesture;
        }
        else {
            this.options.gestureSettings.push(newGesture);
        }

        await chrome.storage.local.set({ 'options': this.options });
    }

    async removeGesture(gesture) {
        const i = this.options.gestureSettings.findIndex(elem => elem.gesture.toString() === gesture);
        if (i !== -1) {
            this.options.gestureSettings.splice(i, 1);

            await chrome.storage.local.set({ 'options': this.options });
        }
    }
}
