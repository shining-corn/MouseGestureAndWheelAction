/**
 * @file content.js
 * @description Main script for the extension. Handles mouse gestures, wheel action and rocker gesture.
 */

/**
 * @import { Point, sendChromeMessage, computeDirection, isInRootWindow, getRootWindow } from './utilities.js';
 * @import { ExtensionOptions, CustomUrlSetting, GestureSetting, DisableExtensionSetting } from './ExtensionOptions.js';
 * @import { InterIframeVariables } from './InterIframeVariables.js';
 * @import { getGestureAction, ActionOption } from './gestureActions.js';
 * @import { GestureElements } from './htmlElements.js';
 * @import { checkHasExtensionBeenUpdated } from './utilities.js';
 */

const global = new InterIframeVariables();

/**
 * @summary Processes the action based on the provided action string and options.
 * @description If the action string starts with 'customurl:', it processes a custom URL action.
 * @param {ExtensionOptions} extensionOptions
 * @param {string} action
 * @param {ActionOption} actionOption
 */
function processAction(extensionOptions, action, actionOption) {
    if (action) {
        if (action.startsWith('customurl:')) {
            const text = global.selectedText;
            const id = action.substring(10);
            const setting = extensionOptions.getCustomUrlSetting(id);
            const hasPlaceholder = setting && setting.customUrl.indexOf('{}') !== -1;

            if (text || !hasPlaceholder) {
                if (setting) {
                    const url = setting.customUrl.replace(/\{\}/ig, encodeURI(text));
                    if (setting.openInNewTab) {
                        sendChromeMessage({ action: 'openlinkinnwetabandactivate', url: url });
                    }
                    else {
                        window.location.href = url;
                    }
                }
                else {
                    window.alert(`${chrome.i18n.getMessage('messageCustomUrlSettingNotFound')} (ID: ${id} )`);
                }
            }
            else {
                window.alert(chrome.i18n.getMessage('messageCustomUrlHelp'));
            }
        }
        else {
            executeAction(action, actionOption);
        }
    }
}

/**
 * @summary MouseGestureAndWheelActionClient class handles mouse gestures, wheel actions and rocker gestures.
 */
class MouseGestureAndWheelActionClient {
    /**
     * @type {ExtensionOptions | undefined}
     */
    #options = undefined;

    /**
     * @type {Point | undefined}
     */
    #previousPoint = undefined;

    /**
     * @type {string | undefined}
     */
    #previousDirection = undefined;

    /**
     * @type {boolean}
     */
    #hasGestureDrawn = false;

    /**
     * @type {GestureElements | undefined}
     */
    #gestureElement = undefined;

    /**
     * @type {string | undefined}
     */
    #url = undefined;

    /**
     * @type {string | undefined}
     */
    #src = undefined;

    /**
     * @type {HTMLElement | undefined}
     */
    #target = undefined;

    /**
     * * @type {number}
     */
    #rightClickCount = 0;

    /**
     * @type {boolean}
     */
    #isRightButtonPressed = false;

    /**
     * @param {ExtensionOptions} options - The options for the extension.
     * @constructor
     */
    constructor(options) {
        this.#options = options;
        this.#gestureElement = new GestureElements(options);
    }

    /**
     * @summary Starts the mouse gesture client.
     * @description Initializes the event listeners for mouse events, text selection and context menu handling.
     */
    start() {
        this.disableExtensionByUrlCondition();

        document.addEventListener("selectionchange", (event) => {
            if (!event.isTrusted || !global.enabledExtension) {
                return;
            }

            const text = window.getSelection().toString();
            if (text) {
                global.selectedText = text;
            }
        });

        window.addEventListener('blur', (event) => {
            if (!event.isTrusted || !global.enabledExtension) {
                return;
            }

            // Reset the state when the tab loses focus
            global.shouldPreventContextMenu = false;    // Disable context menu suppression when leaving a tab
            this.resetGestureState();
            this.#isRightButtonPressed = false;
        });

        window.addEventListener('wheel', (event) => {
            if (!event.isTrusted || !global.enabledExtension) {
                return;
            }

            const isWheelAction = () => this.#options.enabledWheelAction && (event.buttons === 2) && !global.onMouseGesture;

            if (isWheelAction()) {
                if (checkHasExtensionBeenUpdated()) {
                    this.resetGestureState();
                    return;
                }

                event.preventDefault();
                global.shouldPreventContextMenu = true;

                this.resetGestureState();    // reset gesture state to prevent conflict with mouse gesture
            }

            (async () => {
                if (isWheelAction()) {
                    this.setActionOptionsFromElement(event.target);
                    if (event.wheelDelta > 0) {
                        executeAction(this.#options.rightButtonAndWheelUp, this.getActionOptions());
                    }
                    else {
                        executeAction(this.#options.rightButtonAndWheelDown, this.getActionOptions());
                    }
                }
            })();
        }, {
            capture: true,  // Measures against stopImmediatePropagation() of other scripts on the WEB site
            passive: false
        });

        window.addEventListener('mousedown', (event) => {
            if (!event.isTrusted || !global.enabledExtension) {
                return;
            }

            if (event.button === 2) {
                this.#isRightButtonPressed = true;
            }

            // Rocker Gesture
            if (event.buttons === 3 && !global.onMouseGesture) {
                if (checkHasExtensionBeenUpdated()) {
                    this.resetGestureState();
                    return;
                }

                let command = '';
                if (event.button === 0 && this.#options.rockerGestureRightLeft) {
                    command = this.#options.rockerGestureRightLeft;
                }
                else if (event.button === 2 && this.#options.rockerGestureLeftRight) {
                    command = this.#options.rockerGestureLeftRight;
                }

                if (command) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    global.shouldPreventContextMenu = true;
                    this.setActionOptionsFromElement(event.target);
                    processAction(this.#options, command, this.getActionOptions());

                    return;
                }
            }

            // Mouse Gesture
            if (this.#options.enabledMouseGesture) {
                if ((event.button === 0) && ((event.buttons & 2) === 2) && (this.#previousPoint || global.onMouseGesture)) {
                    if (checkHasExtensionBeenUpdated()) {
                        this.resetGestureState();
                        return;
                    }

                    event.preventDefault();
                    event.stopImmediatePropagation();

                    global.onMouseGesture = true;
                    global.arrows += 'Click ';
                    getRootWindow().postMessage(
                        {
                            extensionId: chrome.runtime.id,
                            type: 'show-arrows',
                            arrows: global.arrows,
                        },
                        '*'
                    );
                    this.#previousDirection = undefined;
                    this.#previousPoint = { x: event.clientX, y: event.clientY };
                    global.shouldPreventContextMenu = true;
                }

                if (event.buttons === 2) {  // right button only
                    if (this.handleContextMenu().shouldStop) {
                        return;
                    }

                    this.#previousPoint = { x: event.clientX, y: event.clientY };
                    this.setActionOptionsFromElement(event.target);
                    this.#target = event.target;
                }
            }
        }, {
            capture: true  // Measures against stopImmediatePropagation() of other scripts on the WEB site
        });

        window.addEventListener('mousemove', (event) => {
            if (!event.isTrusted || !global.enabledExtension) {
                return;
            }

            const strokeLength = this.#options.mouseGestureStrokeLength;

            if ((event.buttons & 2) === 2 && this.#previousPoint && ((event.buttons & 1) === 0)) {
                const diffX = event.clientX - this.#previousPoint.x;
                const diffY = event.clientY - this.#previousPoint.y;
                const distanceSquare = diffX * diffX + diffY * diffY;

                if (this.#hasGestureDrawn) {
                    this.drawGestureTrail({ x: event.clientX, y: event.clientY });
                }

                if (distanceSquare >= strokeLength * strokeLength) {
                    if (checkHasExtensionBeenUpdated()) {
                        this.resetGestureState();
                        return;
                    }

                    this.#rightClickCount = 0;   // Reset the state to prevent it from being misjudged as a right double-click when a mouse gesture is repeated quickly.

                    const currentPoint = { x: event.clientX, y: event.clientY };
                    if (!this.#hasGestureDrawn) {
                        this.drawGestureTrail(this.#previousPoint);
                        this.drawGestureTrail(currentPoint);
                    }

                    this.#previousPoint = currentPoint;

                    const direction = computeDirection(diffX, diffY);
                    if (direction && direction !== this.#previousDirection) {
                        global.onMouseGesture = true;
                        global.arrows += direction;
                        getRootWindow().postMessage(
                            {
                                extensionId: chrome.runtime.id,
                                type: 'show-arrows',
                                arrows: global.arrows,
                            },
                            '*'
                        );
                        this.#previousDirection = direction;

                        global.shouldPreventContextMenu = true;
                    }
                }
            }
            else if (((event.buttons && 2) === 0) && (global.onMouseGesture)) {
                // Handle a case where the right button mouse-up event has not been caught.
                const actionOption = this.getActionOptions();
                const command = this.#options.getGestureAction(global.arrows);
                processAction(this.#options, command, actionOption);

                getRootWindow().postMessage({
                    extensionId: chrome.runtime.id,
                    type: 'reset-gesture',
                }, '*');
                this.doneGesture();

                this.#url = undefined;
                this.#src = undefined;
                global.onMouseGesture = false;
            }
        }, {
            capture: true  // Measures against stopImmediatePropagation() of other scripts on the WEB site
        });

        window.addEventListener('mouseup', (event) => {
            if (!event.isTrusted || !global.enabledExtension) {
                return;
            }

            if (event.button === 2) {
                this.#isRightButtonPressed = false;
            }

            // Mouse Gesture
            if (event.button === 2) {
                if (global.onMouseGesture) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    global.shouldPreventContextMenu = true;

                    const actionOption = this.getActionOptions();
                    setTimeout(() => {  // Use setTimeout to wait for global.shouldPreventContextMenu changes to be reflected in other frames
                        const command = this.#options.getGestureAction(global.arrows);
                        processAction(this.#options, command, actionOption);

                        getRootWindow().postMessage({
                            extensionId: chrome.runtime.id,
                            type: 'reset-gesture',
                        }, '*');
                        this.doneGesture();
                    }, 0);
                }
                else if (this.#hasGestureDrawn) {
                    global.shouldPreventContextMenu = true;
                    this.doneGesture();
                }

                this.#url = undefined;
                this.#src = undefined;
                global.onMouseGesture = false;
            }
        }, {
            capture: true  // Measures against stopImmediatePropagation() of other scripts on the WEB site
        });

        chrome.runtime.onMessage.addListener((request) => {
            if (request.extensionId !== chrome.runtime.id) {
                return;
            }

            if (request.type === 'prevent-contextmenu') {
                global.shouldPreventContextMenu = true;
                this.#isRightButtonPressed = true;   // It should have been moved from another tab with the right button held down, so set it to true.
            }
            else if (request.type === 'reset-prevent-contextmenu') {
                global.shouldPreventContextMenu = false;
            }
        });

        window.addEventListener('contextmenu', (event) => {
            if (!event.isTrusted || !global.enabledExtension) {
                return;
            }

            if (global.shouldPreventContextMenu) {
                event.preventDefault();
            }
            global.shouldPreventContextMenu = false;
        });

        window.addEventListener('click', (event) => {
            if (!event.isTrusted || !global.enabledExtension) {
                return;
            }
            
            if (((event.button === 0) && global.onMouseGesture) ||     // During mouse gesture
                ((event.button === 0) && (event.buttons === 2))      // During rocker gesture
            ) {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        }, {
            capture: true  // Measures against stopImmediatePropagation() of other scripts on the WEB site
        });

        window.addEventListener('message', (event) => {
            if (event.data.extensionId === chrome.runtime.id && event.data.type === 'disable-mousegesture') {
                global.enabledExtension = false;
            }
        });
    }

    /**
     * @summary Ends the mouse gesture.
     */
    doneGesture() {
        if (this.#previousPoint) {
            this.#previousPoint = undefined;
            this.#previousDirection = undefined;

            if (this.#hasGestureDrawn) {
                this.#gestureElement.removeFrom(document.body);
            }
            this.#gestureElement.reset();
            this.#hasGestureDrawn = false;
        }
        global.arrows = '';
    }

    /**
     * @summary Resets the gesture state.
     */
    resetGestureState() {
        if (this.#previousPoint) {
            this.doneGesture();
            global.shouldPreventContextMenu = false;
            getRootWindow().postMessage({ extensionId: chrome.runtime.id, type: 'reset-gesture' }, `*`);
        }

        global.arrows = '';
        this.#url = undefined;
        this.#src = undefined;
        this.#target = undefined;
        this.#rightClickCount = 0;
        global.onMouseGesture = false;
    }

    /**
     * @summary Draws the gesture trail.
     * @param {Point} point 
     */
    drawGestureTrail(point) {
        if (this.#hasGestureDrawn === false) {
            this.#hasGestureDrawn = true;
            this.#gestureElement.insertTo(document.body);
            this.#gestureElement.drawLine(point);
        }
        else {
            this.#gestureElement.drawLine(point);
        }
    }

    /**
     * @summary Sets the action options from the target element.
     * @param {HTMLElement} element 
     */
    setActionOptionsFromElement(element) {
        this.#target = element;

        // get url and src attribute
        this.#url = undefined;
        this.#src = undefined;
        let elem = element;
        while (elem) {
            if (elem.href) {
                this.#url = elem.href;
                break;
            }
            else if (elem.src) {
                this.#src = elem.src;
                break;
            }

            elem = elem.parentNode;
        }
    }

    /**
     * @summary Returns the action options.
     * @returns {ActionOption}
     */
    getActionOptions() {
        return {
            target: this.#target,
            url: this.#url,
            src: this.#src,
            shouldPreventContextMenu: this.#isRightButtonPressed,
        }
    }

    /**
     * Processing for macOS/Linux to display context menu when right button is pressed.
     * Right double-click to display context menu.
     * @returns Whether the mouse gesture process should be interrupted
     */
    handleContextMenu() {
        if (this.#options.rightDoubleClickToContextMenu) {
            this.#rightClickCount++;
            if (this.#rightClickCount === 1) {
                global.shouldPreventContextMenu = true;
                this.rightClickTimeout = setTimeout(() => {
                    this.#rightClickCount = 0;
                }, 750);
            }
            else if (this.#rightClickCount === 2) {
                clearTimeout(this.rightClickTimeout);
                this.#rightClickCount = 0;
                global.shouldPreventContextMenu = false;
                return { shouldStop: true };
            }
        }
        return { shouldStop: false };
    }

    /**
     * @summary Disables the extension based on the URL condition.
     */
    disableExtensionByUrlCondition() {
        if ((Object.prototype.toString.call(this.#options.disableExtensionSettings) !== '[object Array]') || (this.#options.disableExtensionSettings.length === 0)) {
            return;
        }

        for (const setting of this.#options.disableExtensionSettings) {
            switch (setting.method) {
                case 'prefixMatch':
                    if (document.location.href.indexOf(setting.value) === 0) {
                        global.enabledExtension = false;
                        return;
                    }
                    break;
                case 'include':
                    if (document.location.href.indexOf(setting.value) !== -1) {
                        global.enabledExtension = false;
                        return;
                    }
                    break;
                case 'regexp':
                    const match = document.location.href.match(`/${setting.value}/`);
                    if (match && match.length) {
                        global.enabledExtension = false;
                        return;
                    }
                    break;
                default:
                    break;
            }
        }
    }
}

(async () => {
    let options = new ExtensionOptions();
    await options.loadFromStrageLocal();
    new MouseGestureAndWheelActionClient(options).start();
    if (isInRootWindow()) {
        new ShowArrowsElement(options);
        (new BookMarkEditDialogElements()).start();

        // Processes gesture execution requests sent from child windows
        window.addEventListener('message', (event) => {
            if (event.data.extensionId !== chrome.runtime.id) {
                return;
            }

            switch (event.data.type) {
                case 'execute-action':
                    executeAction(event.data.action, event.data.option);
                    break;
            }
        });
    }
})();
