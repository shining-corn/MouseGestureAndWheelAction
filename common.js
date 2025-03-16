function sendChromeMessage(request) {
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
 * 指定されたHTMLElementかその上位のHTMLElementがスクロール可能であればスクロールする
 * @param element スクロール対象の起点となるHTMLElement
 * @returns スクロールしなかった場合はtrue、スクロールした場合はfalse
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
 * 指定されたHTMLElementかその上位のHTMLElementがスクロール可能であればスクロールする
 * @param element スクロール対象の起点となるHTMLElement
 * @returns スクロールしなかった場合はtrue、スクロールした場合はfalse
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
 * 指定されたHTMLElementかその上位のHTMLElementがスクロール可能であればスクロールする
 * @param element スクロール対象の起点となるHTMLElement
 * @returns スクロールしなかった場合はtrue、スクロールした場合はfalse
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
 * 指定されたHTMLElementかその上位のHTMLElementがスクロール可能であればスクロールする
 * @param element スクロール対象の起点となるHTMLElement
 * @returns スクロールしなかった場合はtrue、スクロールした場合はfalse
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
        gotolefttab: (shouldPreventContextMenu) => {
            sendChromeMessage({ action: 'gotolefttab', shouldPreventContextMenu: shouldPreventContextMenu });
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
        gotoprevioustab: () => {
            sendChromeMessage({ action: 'gotoprevioustab' });
        },
        gotonexttab: () => {
            sendChromeMessage({ action: 'gotonexttab' });
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
                rightButtonAndWheelUp: 'gotolefttab',
                rightButtonAndWheelDown: 'gotorighttab',

                enabledMouseGesture: true,
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
            };

            await chrome.storage.local.set({ options: this.options });
        }
    }

    async createDefaultCustomUrlSettings() {
        if (!this.options) {
            return;
        }
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

        await chrome.storage.local.set({ options: this.options });
    }

    async setOptions(options) {
        this.options = options;

        await chrome.storage.local.set({ 'options': this.options });
    }

    get gestureSettings() {
        return this.options.gestureSettings;
    }

    getGestureAction(gesture) {
        // mouse gesture
        if (this.options.gestureSettings && (typeof this.options.gestureSettings.findIndex === 'function')) {
            const i = this.options.gestureSettings.findIndex(elem => elem.gesture.toString() === gesture);
            if (i !== -1) {
                return this.options.gestureSettings[i].action;
            }
        }
        return undefined;
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

    get enabledWheelAction() {
        return this.options.enabledWheelAction;
    }

    async changeEnabledWheelAction(enabled) {
        this.options.enabledWheelAction = enabled;
        await chrome.storage.local.set({ 'options': this.options });
    }

    get enabledMouseGesture() {
        return this.options.enabledMouseGesture;
    }

    async changeEnabledMouseGesture(enabled) {
        this.options.enabledMouseGesture = enabled;
        await chrome.storage.local.set({ 'options': this.options });
    }

    get rightDoubleClickToContextMenu() {
        return this.options.rightDoubleClickToContextMenu;
    }

    async changeRightDoubleClickToContextMenu(enabled) {
        this.options.rightDoubleClickToContextMenu = enabled;
        await chrome.storage.local.set({ 'options': this.options });
    }

    get rightButtonAndWheelUp() {
        return this.options.rightButtonAndWheelUp;
    }

    async changeRightClickWheelUpAction(action) {
        this.options.rightButtonAndWheelUp = action;
        await chrome.storage.local.set({ 'options': this.options });
    }

    get rightButtonAndWheelDown() {
        return this.options.rightButtonAndWheelDown;
    }

    async changeRightClickWheelDownAction(action) {
        this.options.rightButtonAndWheelDown = action;
        await chrome.storage.local.set({ 'options': this.options });
    }

    get rockerGestureLeftRight() {
        return this.options.rockerGestureLeftRight;
    }

    async changeRockerGestureLeftRight(action) {
        this.options.rockerGestureLeftRight = action;
        await chrome.storage.local.set({ 'options': this.options });
    }

    get rockerGestureRightLeft() {
        return this.options.rockerGestureRightLeft;
    }

    async changeRockerGestureRightLeft(action) {
        this.options.rockerGestureRightLeft = action;
        await chrome.storage.local.set({ 'options': this.options });
    }

    get customUrlSettings() {
        return this.options.customUrlSettings;
    }

    getCustomUrlSetting(id) {
        if (this.options.customUrlSettings && (typeof this.options.customUrlSettings.find === 'function')) {
            return this.options.customUrlSettings.find(elem => elem.id === id);
        }
        return undefined;
    }

    async setCustomUrlSettings(customUrlSettings) {
        this.options.customUrlSettings = customUrlSettings;

        await chrome.storage.local.set({ 'options': this.options });
    }

    get disableExtensionSettings() {
        return this.options.disableExtensionSettings;
    }

    async setDisableExtensionSettings(disableExtensionSettings) {
        this.options.disableExtensionSettings = disableExtensionSettings;

        await chrome.storage.local.set({ 'options': this.options });
    }

    get gestureLineColor() {
        if (typeof this.options.gestureLineColor === 'string' && this.options.gestureLineColor) {
            return this.options.gestureLineColor;
        }

        return 'rgba(128, 128, 255, 0.9)';
    }

    get hideGestureLine() {
        return this.options.hideGestureLine || false;
    }

    get gestureArrowColor() {
        if (typeof this.options.gestureArrowColor === 'string' && this.options.gestureArrowColor) {
            return this.options.gestureArrowColor;
        }

        return 'rgba(239, 239, 255, 0.9)';
    }

    get gestureArrowFontSize() {
        if (typeof this.options.gestureArrowFontSize === 'number' && this.options.gestureArrowFontSize) {
            return this.options.gestureArrowFontSize;
        }

        return 64;
    }

    get hideGestureArrow() {
        return this.options.hideGestureArrow || false;
    }

    get gestureFontColor() {
        if (typeof this.options.gestureFontColor === 'string' && this.options.gestureFontColor) {
            return this.options.gestureFontColor;
        }

        return 'rgba(239, 239, 255, 0.9)';
    }

    get gestureTextFontSize() {
        if (typeof this.options.gestureTextFontSize === 'number' && this.options.gestureTextFontSize) {
            return this.options.gestureTextFontSize;
        }

        return 24;
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

    async setGestureAppearance(lineColor, hideLine, arrowColor, arrowFontSize, hideArrow, textColor, textFontSize, hideText, backgroundColor, hideBackground) {
        this.options.gestureLineColor = lineColor;
        this.options.hideGestureLine = hideLine;

        this.options.gestureArrowColor = arrowColor;
        this.options.gestureArrowFontSize = arrowFontSize;
        this.options.hideGestureArrow = hideArrow;

        this.options.gestureFontColor = textColor;
        this.options.gestureTextFontSize = textFontSize;
        this.options.hideGestureText = hideText;

        this.options.gestureBackgroundColor = backgroundColor;
        this.options.hideGestureBackground = hideBackground;

        await chrome.storage.local.set({ 'options': this.options });
    }

    get mouseGestureStrokeLength() {
        if (typeof this.options.mouseGestureStrokeLength === 'number' && this.options.mouseGestureStrokeLength) {
            return this.options.mouseGestureStrokeLength;
        }

        return 16;
    }

    async setMouseGestureStrokeLength(length) {
        this.options.mouseGestureStrokeLength = length;
        await chrome.storage.local.set({ 'options': this.options });
    }

    get hideHintPermanently() {
        return this.options.hideHintPermanently;
    }

    async setHideHintPermanently(hide) {
        this.options.hideHintPermanently = hide;

        await chrome.storage.local.set({ 'options': this.options });
    }
}
