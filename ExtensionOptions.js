/**
 * @file ExtensionOptions.js
 * @description This file contains the ExtensionOptions class, which manages the extension's options and settings.
 */

class ExtensionOptions {
    constructor() {
        this.options = undefined;

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
        if (options) {
            this.options = options;

            await chrome.storage.local.set({ 'options': this.options });
        }
    }

    get gestureSettings() {
        return this.options?.gestureSettings || {};
    }

    getGestureAction(gesture) {
        if (this.options && this.options.gestureSettings && (typeof this.options.gestureSettings.findIndex === 'function')) {
            const i = this.options.gestureSettings.findIndex(elem => elem.gesture.toString() === gesture);
            if (i !== -1) {
                return this.options.gestureSettings[i]?.action || '';
            }
        }
        return '';
    }

    async upsertGesture(gesture, action) {
        if (!this.options) {
            await this.loadFromStrageLocal();
        }

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
        if (!this.options) {
            await this.loadFromStrageLocal();
        }

        const i = this.options.gestureSettings.findIndex(elem => elem.gesture.toString() === gesture);
        if (i !== -1) {
            this.options.gestureSettings.splice(i, 1);

            await chrome.storage.local.set({ 'options': this.options });
        }
    }

    get enabledWheelAction() {
        return this.options?.enabledWheelAction || false;
    }

    async changeEnabledWheelAction(enabled) {
        if (!this.options) {
            await this.loadFromStrageLocal();
        }

        this.options.enabledWheelAction = enabled;
        await chrome.storage.local.set({ 'options': this.options });
    }

    get enabledMouseGesture() {
        return this.options?.enabledMouseGesture || false;
    }

    async changeEnabledMouseGesture(enabled) {
        if (!this.options) {
            await this.loadFromStrageLocal();
        }

        this.options.enabledMouseGesture = enabled;
        await chrome.storage.local.set({ 'options': this.options });
    }

    get rightDoubleClickToContextMenu() {
        return this.options?.rightDoubleClickToContextMenu || false;
    }

    async changeRightDoubleClickToContextMenu(enabled) {
        if (!this.options) {
            await this.loadFromStrageLocal();
        }

        this.options.rightDoubleClickToContextMenu = enabled;
        await chrome.storage.local.set({ 'options': this.options });
    }

    get rightButtonAndWheelUp() {
        return this.options?.rightButtonAndWheelUp;
    }

    async changeRightClickWheelUpAction(action) {
        if (!this.options) {
            await this.loadFromStrageLocal();
        }

        this.options.rightButtonAndWheelUp = action;
        await chrome.storage.local.set({ 'options': this.options });
    }

    get rightButtonAndWheelDown() {
        return this.options?.rightButtonAndWheelDown;
    }

    async changeRightClickWheelDownAction(action) {
        if (!this.options) {
            await this.loadFromStrageLocal();
        }

        this.options.rightButtonAndWheelDown = action;
        await chrome.storage.local.set({ 'options': this.options });
    }

    get rockerGestureLeftRight() {
        return this.options?.rockerGestureLeftRight;
    }

    async changeRockerGestureLeftRight(action) {
        if (!this.options) {
            await this.loadFromStrageLocal();
        }

        this.options.rockerGestureLeftRight = action;
        await chrome.storage.local.set({ 'options': this.options });
    }

    get rockerGestureRightLeft() {
        return this.options?.rockerGestureRightLeft;
    }

    async changeRockerGestureRightLeft(action) {
        if (!this.options) {
            await this.loadFromStrageLocal();
        }

        this.options.rockerGestureRightLeft = action;
        await chrome.storage.local.set({ 'options': this.options });
    }

    get customUrlSettings() {
        return this.options?.customUrlSettings;
    }

    getCustomUrlSetting(id) {
        if (this.options?.customUrlSettings && (typeof this.options?.customUrlSettings.find === 'function')) {
            return this.options.customUrlSettings.find(elem => elem.id === id);
        }
        return undefined;
    }

    async setCustomUrlSettings(customUrlSettings) {
        if (!this.options) {
            await this.loadFromStrageLocal();
        }

        this.options.customUrlSettings = customUrlSettings;

        await chrome.storage.local.set({ 'options': this.options });
    }

    get disableExtensionSettings() {
        return this.options?.disableExtensionSettings;
    }

    async setDisableExtensionSettings(disableExtensionSettings) {
        if (!this.options) {
            await this.loadFromStrageLocal();
        }

        this.options.disableExtensionSettings = disableExtensionSettings;

        await chrome.storage.local.set({ 'options': this.options });
    }

    get gestureLineColor() {
        if (typeof this.options?.gestureLineColor === 'string' && this.options.gestureLineColor) {
            return this.options.gestureLineColor;
        }

        return 'rgba(128, 128, 255, 0.9)';
    }

    get hideGestureLine() {
        return this.options?.hideGestureLine || false;
    }

    get gestureArrowColor() {
        if (typeof this.options?.gestureArrowColor === 'string' && this.options.gestureArrowColor) {
            return this.options.gestureArrowColor;
        }

        return 'rgba(239, 239, 255, 0.9)';
    }

    get gestureArrowFontSize() {
        if (typeof this.options?.gestureArrowFontSize === 'number' && this.options.gestureArrowFontSize) {
            return this.options.gestureArrowFontSize;
        }

        return 64;
    }

    get hideGestureArrow() {
        return this.options?.hideGestureArrow || false;
    }

    get gestureFontColor() {
        if (typeof this.options?.gestureFontColor === 'string' && this.options.gestureFontColor) {
            return this.options.gestureFontColor;
        }

        return 'rgba(239, 239, 255, 0.9)';
    }

    get gestureTextFontSize() {
        if (typeof this.options?.gestureTextFontSize === 'number' && this.options.gestureTextFontSize) {
            return this.options.gestureTextFontSize;
        }

        return 24;
    }

    get hideGestureText() {
        return this.options?.hideGestureText || false;
    }

    get gestureBackgroundColor() {
        if (typeof this.options?.gestureBackgroundColor === 'string' && this.options.gestureBackgroundColor) {
            return this.options.gestureBackgroundColor;
        }

        return 'rgba(0, 0, 32, 0.9)';
    }

    get hideGestureBackground() {
        return this.options?.hideGestureBackground || false;
    }

    async setGestureAppearance(lineColor, hideLine, arrowColor, arrowFontSize, hideArrow, textColor, textFontSize, hideText, backgroundColor, hideBackground) {
        if (!this.options) {
            await this.loadFromStrageLocal();
        }

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
        if (typeof this.options?.mouseGestureStrokeLength === 'number' && this.options.mouseGestureStrokeLength) {
            return this.options.mouseGestureStrokeLength;
        }

        return 16;
    }

    async setMouseGestureStrokeLength(length) {
        if (!this.options) {
            await this.loadFromStrageLocal();
        }

        this.options.mouseGestureStrokeLength = length;
        await chrome.storage.local.set({ 'options': this.options });
    }

    get previousTabHistorySize() {
        if (typeof this.options?.previousTabHistorySize === 'number' && this.options.previousTabHistorySize) {
            return this.options.previousTabHistorySize;
        }

        return 4096;
    }

    async setPreviousTabHistorySize(size) {
        if (!this.options) {
            await this.loadFromStrageLocal();
        }

        this.options.previousTabHistorySize = size;
        await chrome.storage.local.set({ 'options': this.options });
    }

    get hideHintPermanently() {
        return this.options?.hideHintPermanently || false;
    }

    async setHideHintPermanently(hide) {
        if (!this.options) {
            await this.loadFromStrageLocal();
        }

        this.options.hideHintPermanently = hide;

        await chrome.storage.local.set({ 'options': this.options });
    }
}
