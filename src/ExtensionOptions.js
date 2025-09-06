/**
 * @file ExtensionOptions.js
 * @description This file contains the ExtensionOptions class, which manages the extension's options and settings.
 */

/**
 * @typedef {object} CustomUrlSetting
 * @property {string} id - The ID of the custom URL setting.
 * @property {string} customUrl - The custom URL template, where "{}" will be replaced with the selected text.
 * @property {boolean} openInNewTab - Whether to open the URL in a new tab or not.
 */

/**
 * @typedef {object} GestureSetting
 * @property {string} gesture - The gesture string (e.g., "←", "→", "↑↓").
 * @property {string} action - The action associated with the gesture (e.g., "back", "forward", "reloadtab").
 */

/**
 * @typedef {object} DisableExtensionSetting
 * @property {string} method - The method used for comparison ("prefixMatch", "include", "regexp")
 * @property {string} value - The value to compare against
 */

/**
 * @class ExtensionOptions
 * @description This class manages the extension's options and settings.
 * It provides methods to load, save, and manipulate the options stored in Chrome's sync storage.
 * It also listens for changes in the storage and updates the options accordingly.
 */
class ExtensionOptions {
    /**
     * @type {ExtensionOptions | undefined}
     */
    #options = undefined;

    /**
     * @constructor
     */
    constructor() {
        chrome.storage.sync.onChanged.addListener((event) => {
            if (event.options && event.options.newValue) {
                this.#options = event.options.newValue;
            }
        })
    }

    /**
     * @summary Loads the options from storage.
     */
    async loadFromStorage() {
        // First, check if options exist in sync storage
        const syncResult = await chrome.storage.sync.get(['options']);
        if (syncResult && syncResult.options && Object.keys(syncResult.options).length !== 0) {
            this.#options = syncResult.options;
            return;
        }

        // If options don't exist in sync storage, try to load them from local storage
        const localResult = await chrome.storage.local.get(['options']);
        if (localResult && localResult.options && Object.keys(localResult.options).length !== 0) {
            this.#options = localResult.options;
            return;
        }

        // If options don't exist in both storages, create default options
        this.#options = this.#createDefaultGestureSettings();
        await chrome.storage.sync.set({ options: this.#options });
    }

    /**
     * @summary Creates default gesture settings if they don't exist.
     */
    #createDefaultGestureSettings() {
        return {
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
    }

    /**
     * @summary Creates default custom URL settings if they don't exist
     */
    async createDefaultCustomUrlSettingsIfNotExist() {
        if (!this.#options) {
            return;
        }

        if (typeof this.#options.customUrlSettings === 'undefined') {
            this.#options.customUrlSettings = [
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
                {
                    id: `${chrome.i18n.getMessage('strCustomUrlGoToSelectedUrl')}`,
                    customUrl: '{}',
                    openInNewTab: true,
                }
            ];
        }

        await chrome.storage.sync.set({ options: this.#options });
    }

    /**
     * @summary Sets the options for the extension.
     * @param {ExtensionOptions} options 
     */
    async setOptions(options) {
        if (options) {
            this.#options = options;
            await chrome.storage.sync.set({ 'options': this.#options });
        }
    }

    /**
     * @summary Gets the options for the extension.
     * @returns {ExtensionOptions} The options for the extension.
     */
    get options() {
        return this.#options;
    }

    /**
     * @summary Gets the options for the extension.
     * @returns {GestureSetting[]} Gesture settings array.
     */
    get gestureSettings() {
        return this.#options?.gestureSettings ?? {};
    }

    /**
     * @summary Gets the action associated with a specific gesture.
     * @param {string} gesture - The gesture string to find the action for.
     * @returns {string} The action associated with the gesture.
     */
    getGestureAction(gesture) {
        if (this.#options && this.#options.gestureSettings && (typeof this.#options.gestureSettings.findIndex === 'function')) {
            const i = this.#options.gestureSettings.findIndex(elem => elem.gesture.toString() === gesture);
            if (i !== -1) {
                return this.#options.gestureSettings[i]?.action ?? '';
            }
        }
        return '';
    }

    /**
     * @summary Upserts a gesture.
     * @param {string} gesture - The gesture string to upsert.
     * @param {string} action - The action to associate with the gesture.
     **/
    async upsertGesture(gesture, action) {
        if (!this.#options) {
            await this.loadFromStorage();
        }

        const newGesture = {
            gesture: gesture,
            action: action
        };

        if (Object.prototype.toString.call(this.#options.gestureSettings) !== '[object Array]') {
            this.#options.gestureSettings = [];
        }

        const i = this.#options.gestureSettings.findIndex(elem => elem.gesture.toString() === gesture);
        if (i !== -1) {
            this.#options.gestureSettings[i] = newGesture;
        }
        else {
            this.#options.gestureSettings.push(newGesture);
        }

        await chrome.storage.sync.set({ 'options': this.#options });
    }

    /**
     * @summary Removes a gesture.
     * @param {string} gesture - The gesture string to remove.
     **/
    async removeGesture(gesture) {
        if (!this.#options) {
            await this.loadFromStorage();
        }

        const i = this.#options.gestureSettings.findIndex(elem => elem.gesture.toString() === gesture);
        if (i !== -1) {
            this.#options.gestureSettings.splice(i, 1);
            await chrome.storage.sync.set({ 'options': this.#options });
        }
    }

    /**
     * @summary Get the enabledWheelAction option.
     * @returns {boolean} Whether the wheel action is enabled or not.
     */
    get enabledWheelAction() {
        return this.#options?.enabledWheelAction ?? false;
    }

    /**
     * @summary Set the enabledWheelAction option.
     * @param {boolean} enabled 
     */
    async setEnabledWheelAction(enabled) {
        if (!this.#options) {
            await this.loadFromStorage();
        }
        this.#options.enabledWheelAction = enabled;
        await chrome.storage.sync.set({ 'options': this.#options });
    }

    /**
     * @summary Get the rightButtonAndWheelUp action.
     * @returns {string} rightButtonAndWheelUp
     */
    get rightButtonAndWheelUp() {
        return this.#options?.rightButtonAndWheelUp;
    }

    /**
     * @summary Set the rightButtonAndWheelUp action.
     * @param {string} action 
     */
    async setRightClickWheelUpAction(action) {
        if (!this.#options) {
            await this.loadFromStorage();
        }
        this.#options.rightButtonAndWheelUp = action;
        await chrome.storage.sync.set({ 'options': this.#options });
    }

    /**
     * @summary Get the rightButtonAndWheelDown action.
     * @returns {string} Right button and wheel down action.
     */
    get rightButtonAndWheelDown() {
        return this.#options?.rightButtonAndWheelDown;
    }

    /**
     * @summary Set the rightButtonAndWheelDown action.
     * @param {string} action
     */
    async setRightClickWheelDownAction(action) {
        if (!this.#options) {
            await this.loadFromStorage();
        }
        this.#options.rightButtonAndWheelDown = action;
        await chrome.storage.sync.set({ 'options': this.#options });
    }

    /**
     * @summary Get the enabledMouseGesture option.
     * @returns {boolean} Whether the mouse gesture is enabled or not.
     */
    get enabledMouseGesture() {
        return this.#options?.enabledMouseGesture ?? false;
    }

    /**
     * @summary Set the enabledMouseGesture option.
     * @param {boolean} enabled 
     */
    async setEnabledMouseGesture(enabled) {
        if (!this.#options) {
            await this.loadFromStorage();
        }
        this.#options.enabledMouseGesture = enabled;
        await chrome.storage.sync.set({ 'options': this.#options });
    }

    /**
     * @summary Get the rightDoubleClickToContextMenu option.
     * @returns {boolean} Whether the right double click to context menu is enabled or not.
     */
    get rightDoubleClickToContextMenu() {
        return this.#options?.rightDoubleClickToContextMenu ?? false;
    }

    /**
     * @summary Set the rightDoubleClickToContextMenu option.
     * @param {boolean} enabled 
     */
    async setRightDoubleClickToContextMenu(enabled) {
        if (!this.#options) {
            await this.loadFromStorage();
        }
        this.#options.rightDoubleClickToContextMenu = enabled;
        await chrome.storage.sync.set({ 'options': this.#options });
    }

    /**
     * @summary Get the mouseGestureStrokeLength option.
     * @returns {number} The length of the mouse gesture stroke.
     */
    get mouseGestureStrokeLength() {
        if (typeof this.#options?.mouseGestureStrokeLength === 'number' && this.#options.mouseGestureStrokeLength) {
            return this.#options.mouseGestureStrokeLength;
        }
        return 16;
    }

    /**
     * @summary Set the mouseGestureStrokeLength option.
     * @param {number} length - The length of the mouse gesture stroke.
     */
    async setMouseGestureStrokeLength(length) {
        if (!this.#options) {
            await this.loadFromStorage();
        }
        this.#options.mouseGestureStrokeLength = length;
        await chrome.storage.sync.set({ 'options': this.#options });
    }

    /**
     * @summary Get the previousTabHistorySize option.
     * @returns {number} The size of the previous tab history.
     */
    get previousTabHistorySize() {
        if (typeof this.#options?.previousTabHistorySize === 'number' && this.#options.previousTabHistorySize) {
            return this.#options.previousTabHistorySize;
        }
        return 4096;
    }

    /**
     * @summary Set the previousTabHistorySize option.
     * @param {number} size - The size of the previous tab history.
     */
    async setPreviousTabHistorySize(size) {
        if (!this.#options) {
            await this.loadFromStorage();
        }
        this.#options.previousTabHistorySize = size;
        await chrome.storage.sync.set({ 'options': this.#options });
    }

    async setGoToOnCloseTab(to) {
        if (!this.#options) {
            await this.loadFromStorage();
        }
        this.#options.goToOnCloseTab = to;
        await chrome.storage.sync.set({ 'options': this.#options });
    }

    get goToOnCloseTab() {
        return this.#options?.goToOnCloseTab ?? 'auto';
    }

    /**
     * @summary Get the rockerGestureLeftRight action.
     * @returns {string | undefined} The action for the left-right rocker gesture.
     */
    get rockerGestureLeftRight() {
        return this.#options?.rockerGestureLeftRight;
    }

    /**
     * @summary Get the option to add a new tab when the last tab is closed.
     * @returns {boolean} Whether the feature is enabled.
     */
    get addNewTabOnLastTabClose() {
        return this.#options?.addNewTabOnLastTabClose ?? false;
    }

    /**
     * @summary Set the option to add a new tab when the last tab is closed.
     * @param {boolean} enabled - Whether to enable the feature.
     */
    async setAddNewTabOnLastTabClose(enabled) {
        this.#options.addNewTabOnLastTabClose = enabled;
        await chrome.storage.sync.set({ 'options': this.#options });
    }

    /**
     * @summary Set the rockerGestureLeftRight action.
     * @param {string} action - The action for the left-right rocker gesture.
     */
    async setRockerGestureLeftRight(action) {
        if (!this.#options) {
            await this.loadFromStorage();
        }
        this.#options.rockerGestureLeftRight = action;
        await chrome.storage.sync.set({ 'options': this.#options });
    }

    /**
     * @summary Get the rockerGestureRightLeft action.
     * @returns {string | undefined} The action for the right-left rocker gesture.
     */
    get rockerGestureRightLeft() {
        return this.#options?.rockerGestureRightLeft;
    }

    /**
     * @summary Set the rockerGestureRightLeft action.
     * @param {string} action - The action for the right-left rocker gesture.
     */
    async setRockerGestureRightLeft(action) {
        if (!this.#options) {
            await this.loadFromStorage();
        }
        this.#options.rockerGestureRightLeft = action;
        await chrome.storage.sync.set({ 'options': this.#options });
    }

    /**
     * @summary Get the customUrlSettings array.
     * @returns {CustomUrlSetting[]} The custom URL settings array.
     */
    get customUrlSettings() {
        return this.#options?.customUrlSettings;
    }

    /**
     * @summary Get a custom URL setting by its ID.
     * @param {string} id - The ID of the custom URL setting to find.
     * @return {CustomUrlSetting | undefined} The custom URL setting with the specified ID, or undefined if not found.
     */
    getCustomUrlSetting(id) {
        if (this.#options?.customUrlSettings && (typeof this.#options?.customUrlSettings.find === 'function')) {
            return this.#options.customUrlSettings.find(elem => elem.id === id);
        }
        return undefined;
    }

    /**
     * @summary Set the custom URL settings array.
     * @param {CustomUrlSetting[]} customUrlSettings - The custom URL settings array to set.
     */
    async setCustomUrlSettings(customUrlSettings) {
        if (!this.#options) {
            await this.loadFromStorage();
        }
        this.#options.customUrlSettings = customUrlSettings;
        await chrome.storage.sync.set({ 'options': this.#options });
    }

    /**
     * @summary Get the option to trim selected text.
     * @returns {boolean} Whether the feature is enabled.
     */
    get shouldTrimSelectedText() {
        return this.#options?.shouldTrimSelectedText ?? false;
    }

    /**
     * @summary Set the option to trim selected text.
     * @param {boolean} enabled - Whether the feature is enabled.
     */
    async setShouldTrimSelectedText(enabled) {
        if (!this.#options) {
            await this.loadFromStorage();
        }
        this.#options.shouldTrimSelectedText = enabled;
        await chrome.storage.sync.set({ 'options': this.#options });
    }

    /**
     * @summary Get the gestureLineColor option.
     * @returns {string} The color of the gesture line.
     */
    get gestureLineColor() {
        if (typeof this.#options?.gestureLineColor === 'string' && this.#options.gestureLineColor) {
            return this.#options.gestureLineColor;
        }
        return 'rgba(128, 128, 255, 0.9)';
    }

    /**
     * @summary Get the gestureLineWidth option.
     * @returns {boolean} Whether the gesture line is hidden or not.
     */
    get hideGestureLine() {
        return this.#options?.hideGestureLine ?? false;
    }

    /**
     * @summary Get the gestureArrowColor option.
     * @returns {string} The color of the gesture arrow.
     */
    get gestureArrowColor() {
        if (typeof this.#options?.gestureArrowColor === 'string' && this.#options.gestureArrowColor) {
            return this.#options.gestureArrowColor;
        }
        return 'rgba(239, 239, 255, 0.9)';
    }

    /**
     * @summary Get the gestureArrowFontSize option.
     * @returns {number} The font size of the gesture arrow.
     */
    get gestureArrowFontSize() {
        if (typeof this.#options?.gestureArrowFontSize === 'number' && this.#options.gestureArrowFontSize) {
            return this.#options.gestureArrowFontSize;
        }
        return 64;
    }

    /**
     * @summary Get the hideGestureArrow option.
     * @returns {boolean} Whether the gesture arrow is hidden or not.
     */
    get hideGestureArrow() {
        return this.#options?.hideGestureArrow ?? false;
    }

    /**
     * @summary Get the gestureFontColor option.
     * @returns {string} The color of the gesture text.
     */
    get gestureFontColor() {
        if (typeof this.#options?.gestureFontColor === 'string' && this.#options.gestureFontColor) {
            return this.#options.gestureFontColor;
        }
        return 'rgba(239, 239, 255, 0.9)';
    }

    /**
     * @summary Get the gestureTextFontSize option.
     * @returns {number} The font size of the gesture text.
     */
    get gestureTextFontSize() {
        if (typeof this.#options?.gestureTextFontSize === 'number' && this.#options.gestureTextFontSize) {
            return this.#options.gestureTextFontSize;
        }
        return 24;
    }

    /**
     * @summary Get the hideGestureText option.
     * @returns {boolean} Whether the gesture text is hidden or not.
     */
    get hideGestureText() {
        return this.#options?.hideGestureText ?? false;
    }

    /**
     * @summary Get the gestureBackgroundColor option.
     * @returns {string} The color of the gesture background.
     */
    get gestureBackgroundColor() {
        if (typeof this.#options?.gestureBackgroundColor === 'string' && this.#options.gestureBackgroundColor) {
            return this.#options.gestureBackgroundColor;
        }
        return 'rgba(0, 0, 32, 0.9)';
    }

    /**
     * @summary Get the hideGestureBackground option.
     * @returns {boolean} Whether the gesture background is hidden or not.
     */
    get hideGestureBackground() {
        return this.#options?.hideGestureBackground ?? false;
    }
    /**
     * @summary Get the showArrowsPosition option.
     * @returns {string} ShowArrowsElement position.
     */
    get showArrowsPosition() {
        return this.#options?.showArrowsPosition || 'center';
    }

    /**
     * @summary Sets the appearance of the gesture.
     * @param {string} lineColor 
     * @param {boolean} hideLine 
     * @param {string} arrowColor 
     * @param {number} arrowFontSize 
     * @param {boolean} hideArrow 
     * @param {string} textColor 
     * @param {number} textFontSize 
     * @param {boolean} hideText 
     * @param {string} backgroundColor 
     * @param {boolean} hideBackground 
     */
    async setGestureAppearance(lineColor, hideLine, arrowColor, arrowFontSize, hideArrow, textColor, textFontSize, hideText, backgroundColor, hideBackground, showArrowsPosition) {
        if (!this.#options) {
            await this.loadFromStorage();
        }

        this.#options.gestureLineColor = lineColor;
        this.#options.hideGestureLine = hideLine;

        this.#options.gestureArrowColor = arrowColor;
        this.#options.gestureArrowFontSize = arrowFontSize;
        this.#options.hideGestureArrow = hideArrow;

        this.#options.gestureFontColor = textColor;
        this.#options.gestureTextFontSize = textFontSize;
        this.#options.hideGestureText = hideText;

        this.#options.gestureBackgroundColor = backgroundColor;
        this.#options.hideGestureBackground = hideBackground;

        this.#options.showArrowsPosition = showArrowsPosition;

        await chrome.storage.sync.set({ 'options': this.#options });
    }

    /**
     * @summary Get the disableExtensionSettings array.
     * @returns {Array<DisableExtensionSetting> | undefined} The disable extension settings array.
     */
    get disableExtensionSettings() {
        return this.#options?.disableExtensionSettings;
    }

    /**
     * @summary Set the disableExtensionSettings array.
     * @param {Array<DisableExtensionSetting>} disableExtensionSettings - The disable extension settings array to set.
     */
    async setDisableExtensionSettings(disableExtensionSettings) {
        if (!this.#options) {
            await this.loadFromStorage();
        }
        this.#options.disableExtensionSettings = disableExtensionSettings;
        await chrome.storage.sync.set({ 'options': this.#options });
    }

    /**
     * @summary Get the hideHintPermanently option.
     * @returns {boolean} Whether the hint is hidden permanently or not.
     */
    get hideHintPermanently() {
        return this.#options?.hideHintPermanently ?? false;
    }

    /**
     * @summary Set the hideHintPermanently option.
     * @param {boolean} hide - Whether to hide the hint permanently or not.
     */
    async setHideHintPermanently(hide) {
        if (!this.#options) {
            await this.loadFromStorage();
        }
        this.#options.hideHintPermanently = hide;
        await chrome.storage.sync.set({ 'options': this.#options });
    }
}
