function sendMessage(request) {
    (async () => {
        request.extensionId = chrome.runtime.id;
        try {
            await chrome.runtime.sendMessage(request);
        }
        catch (e) {
            console.log(e);
        }
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
        addtabtogroup: () => {
            sendMessage({ action: 'addtabtogroup' });
        },
        removetabfromgroup: () => {
            sendMessage({ action: 'removetabfromgroup' });
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
        reloadtaball: () => {
            sendMessage({ action: 'reloadtaball' });
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
        gotoprevioustab: () => {
            sendMessage({ action: 'gotoprevioustab' });
        },
        gotonexttab: () => {
            sendMessage({ action: 'gotonexttab' });
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
        openlinkinnwetab: (option) => {
            if (option.url) {
                sendMessage({ action: 'openlinkinnwetab', url: option.url });
            }
        },
        openlinkinnwetabandactivate: (option) => {
            if (option.url) {
                sendMessage({ action: 'openlinkinnwetabandactivate', url: option.url });
            }
        },
        openlinkinnwewindow: (option) => {
            if (option.url) {
                sendMessage({ action: 'openlinkinnwewindow', url: option.url });
            }
        },
        openlinkinnwewindowandactivate: (option) => {
            if (option.url) {
                sendMessage({ action: 'openlinkinnwewindowandactivate', url: option.url });
            }
        },
        openimageinnewtab: (option) => {
            if (option.src) {
                sendMessage({ action: 'openlinkinnwetab', url: option.src });
            }
        },
        openimageinnewtabandactivate: (option) => {
            if (option.src) {
                sendMessage({ action: 'openlinkinnwetabandactivate', url: option.src });
            }
        },
        openimageinnewwindow: (option) => {
            if (option.src) {
                sendMessage({ action: 'openlinkinnwewindow', url: option.src });
            }
        },
        openimageinnewwindowandactivate: (option) => {
            if (option.src) {
                sendMessage({ action: 'openlinkinnwewindowandactivate', url: option.src });
            }
        },
        openoptionspage: () => {
            sendMessage({ action: 'openoptionspage' });
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
                    { gesture: 'Click ', action: 'openlinkinnwetabandactivate' },
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
                    { gesture: '←→', action: 'mutetabtoggle' },
                ],
                customUrlSettings: [
                    {
                        id: 'Google',
                        customUrl: 'https://google.com/search?q={}',
                        openInNewTab: true,
                    },
                    {
                        id: 'YouTube',
                        customUrl: 'https://www.youtube.com/results?search_query={}',
                        openInNewTab: true,
                    },
                ],
                gestureLineColor: '#408040',
                gestureFontColor: 'rgba(239, 239, 255, 0.9)',
                gestureBackgroundColor: 'rgba(0, 0, 32, 0.9)',
            };

            await chrome.storage.local.set({ options: this.options });
        }
    }

    async versionUp() {
        if (this.options) {
            // v1.3.0 -> v1.4.0
            if (typeof this.options.customUrlSettings === 'undefined') {
                this.options.customUrlSettings = [
                    {
                        id: 'Google',
                        customUrl: 'https://google.com/search?q={}',
                        openInNewTab: true,
                    },
                    {
                        id: 'YouTube',
                        customUrl: 'https://www.youtube.com/results?search_query={}',
                        openInNewTab: true,
                    },
                ];
            }

            if (typeof this.options.gestureLineColor === 'undefined') {
                this.options.gestureLineColor = '#408040';
            }
            if (typeof this.options.gestureFontColor === 'undefined') {
                this.options.gestureFontColor = 'rgba(239, 239, 255, 0.9)';
            }
            if (typeof this.options.gestureBackgroundColor === 'undefined') {
                this.options.gestureBackgroundColor = 'rgba(0, 0, 32, 0.9)';
            }

            await chrome.storage.local.set({ options: this.options });
        }
    }

    get enabledWheelAction() {
        return this.options.enabledWheelAction;
    }

    get enabledMouseGesture() {
        return this.options.enabledMouseGesture;
    }

    get rightDoubleClickToContextMenu() {
        return this.options.rightDoubleClickToContextMenu;
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

    get customUrlSettings() {
        return this.options.customUrlSettings;
    }

    get disableExtensionSettings() {
        return this.options.disableExtensionSettings;
    }

    get gestureLineColor() {
        if (typeof this.options.gestureLineColor === 'string' && this.options.gestureLineColor) {
            return this.options.gestureLineColor;
        }

        return '#408040';
    }

    get hideGestureLine() {
        return this.options.hideGestureLine || false;
    }

    get gestureFontColor() {
        if (typeof this.options.gestureFontColor === 'string' && this.options.gestureFontColor) {
            return this.options.gestureFontColor;
        }

        return 'rgba(239, 239, 255, 0.9)';
    }

    get hideGestureText() {
        return this.options.hideGestureText || false;
    }

    get gestureBackgroundColor() {
        if (typeof this.options.gestureBackgroundColor === 'string' && this.options.gestureBackgroundColor) {
            return this.options.gestureBackgroundColor;
        }

        return 'rgba(0, 0, 32, 0.9)';
    }

    get hideGestureBackground() {
        return this.options.hideGestureBackground || false;
    }

    get hideHintPermanently() {
        return this.options.hideHintPermanently;
    }

    async setGestureColor(line, hideGestureLine, font, hideGestureText, background, hideGestureBackground) {
        if (typeof line === 'string') {
            this.options.gestureLineColor = line;
        }
        this.options.hideGestureLine = hideGestureLine;

        if (typeof font === 'string') {
            this.options.gestureFontColor = font;
        }
        this.options.hideGestureText = hideGestureText;

        if (typeof background === 'string') {
            this.options.gestureBackgroundColor = background;
        }
        this.options.hideGestureBackground = hideGestureBackground;

        await chrome.storage.local.set({ 'options': this.options });
    }

    getGestureAction(gesture) {
        if (this.options.gestureSettings && (typeof this.options.gestureSettings.findIndex === 'function')) {
            const i = this.options.gestureSettings.findIndex(elem => elem.gesture.toString() === gesture);
            if (i !== -1) {
                return this.options.gestureSettings[i].action;
            }
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

    async changeRightDoubleClickToContextMenu(enabled) {
        this.options.rightDoubleClickToContextMenu = enabled;
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

        if (Object.prototype.toString.call(this.options.gestureSettings) !== '[object Array]') {
            this.options.gestureSettings = [];
        }

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

    async setCustomUrlSettings(customUrlSettings) {
        this.options.customUrlSettings = customUrlSettings;

        await chrome.storage.local.set({ 'options': this.options });
    }

    getCustomUrlSetting(id) {
        if (this.options.customUrlSettings && (typeof this.options.customUrlSettings.find === 'function')) {
            return this.options.customUrlSettings.find(elem => elem.id === id);
        }
        return undefined;
    }

    async setDisableExtensionSettings(disableExtensionSettings) {
        this.options.disableExtensionSettings = disableExtensionSettings;

        await chrome.storage.local.set({ 'options': this.options });
    }

    async setOptions(options) {
        this.options = options;

        await chrome.storage.local.set({ 'options': this.options });
    }

    async setHideHintPermanently(hide) {
        this.options.hideHintPermanently = hide;

        await chrome.storage.local.set({ 'options': this.options });
    }
}
