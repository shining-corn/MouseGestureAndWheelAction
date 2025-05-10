/**
 * @file options.js
 * @description Options page for the extension.
 */

/**
 * @import { Point, computeDirection } from './utilities.js';
 */

/**
 * @summary Mouse gesture elements for the options page.
 */
class OptionGestureElements {
    /**
     * @type {ExtensionOptions | undefined}
     */
    #options = undefined;

    /**
     * @type {Point | undefined}
     */
    #previousPoint = undefined;

    /**
     * @type {string}
     */
    #arrows = '';

    /**
     * @type {HTMLElement | undefined}
     */
    #containerElement = undefined;

    /**
     * @type {HTMLElement | undefined}
     */
    #centerBox = undefined;

    /**
     * @type {HTMLElement | undefined}
     */
    #descriptionElement = undefined;

    /**
     * @type {HTMLElement | undefined}
     */
    #arrowsElement = undefined;

    /**
     * @type {HTMLElement | undefined}
     */
    #parentElement = undefined;

    /**
     * @constructor
     * @param {ExtensionOptions} options
     * @param {string} gestureDescription
     */
    constructor(options, gestureDescription) {
        this.#options = options;
        this.createElements(gestureDescription);
    }

    /**
     * @summary Create elements to make arrows of mouse gesture.
     * @param {string} description - The description of how to make arrows.
     */
    createElements(description) {
        this.#containerElement = document.createElement('div');
        this.#containerElement.style.width = '100vw';
        this.#containerElement.style.height = '100vh';
        this.#containerElement.style.position = 'fixed';
        this.#containerElement.style.left = '0px';
        this.#containerElement.style.top = '0px';
        this.#containerElement.style.zIndex = 16777270;
        this.#containerElement.style.margin = '0px';
        this.#containerElement.style.padding = '0px';
        this.#containerElement.style.border = 'none';
        this.#containerElement.style.color = this.#options.gestureFontColor;
        this.#containerElement.style.backgroundColor = this.#options.gestureBackgroundColor;

        this.#centerBox = document.createElement('div');
        this.#containerElement.appendChild(this.#centerBox);
        this.#centerBox.style.top = '0';
        this.#centerBox.style.bottom = '0';
        this.#centerBox.style.left = '0';
        this.#centerBox.style.right = '0';
        this.#centerBox.style.margin = 'auto';
        this.#centerBox.style.padding = '0px';
        this.#centerBox.style.border = 'none';
        this.#centerBox.style.position = 'absolute';
        this.#centerBox.style.maxWidth = '100vw';
        this.#centerBox.style.width = 'fit-content';
        this.#centerBox.style.height = 'fit-content';
        this.#centerBox.style.textAlign = 'center';
        this.#centerBox.style.backgroundColor = 'transparent';

        this.#descriptionElement = document.createElement('span');
        this.#centerBox.appendChild(this.#descriptionElement);
        this.#descriptionElement.style.width = 'fit-content';
        this.#descriptionElement.style.height = 'fit-content';
        this.#descriptionElement.style.backgroundColor = 'transparent';
        this.#descriptionElement.innerText = description;
        this.#descriptionElement.style.pointerEvents = 'none';   // To prevent malfunctions caused by left-clicking during mouse gestures.
        this.#descriptionElement.style.userSelect = 'none';      // same as above

        this.#arrowsElement = document.createElement('div');
        this.#centerBox.appendChild(this.#arrowsElement);
        this.#arrowsElement.style.fontWeight = 'bold';
        this.#arrowsElement.style.padding = '24px';
        this.#arrowsElement.style.left = '0';
        this.#arrowsElement.style.right = '0';
        this.#arrowsElement.style.margin = 'auto';
        this.#arrowsElement.style.border = 'none';
        this.#arrowsElement.style.fontSize = '64px';
        this.#arrowsElement.style.lineHeight = '1';
        this.#arrowsElement.style.fontFamily = 'monospace';
        this.#arrowsElement.style.maxWidth = 'calc(100vw - 64px)';
        this.#arrowsElement.style.width = 'fit-content';
        this.#arrowsElement.style.height = 'fit-content';
        this.#arrowsElement.style.overflowWrap = 'anywhere';
        this.#arrowsElement.style.backgroundColor = 'transparent';
        this.#arrowsElement.style.pointerEvents = 'none';
        this.#arrowsElement.style.userSelect = 'none';

        this.canvasElement = document.createElement('canvas');
        this.#containerElement.appendChild(this.canvasElement);
        this.canvasElement.style.zIndex = 16777271;
        this.canvasElement.width = document.documentElement.clientWidth;
        this.canvasElement.height = document.documentElement.clientHeight;
        this.canvasElement.style.backgroundColor = 'transparent';
    }

    /**
     * @summary Show the mouse gesture elements.
     * @param {HTMLElement} parentElement 
     */
    start(parentElement) {
        parentElement.appendChild(this.#containerElement);
        this.#parentElement = parentElement;
    }

    /**
     * @summary Hide the mouse gesture elements.
     */
    end() {
        if (this.#containerElement) {
            this.#parentElement.removeChild(this.#containerElement);
        }
    }

    /**
     * @summary Draw a mouse gesture trail on the canvas.
     * @param {Point} point 
     */
    drawLine(point) {
        if (this.#previousPoint) {
            const ctx = this.canvasElement.getContext('2d');
            ctx.lineWidth = 4;
            ctx.strokeStyle = this.#options.gestureLineColor;
            ctx.beginPath();
            ctx.moveTo(this.#previousPoint.x, this.#previousPoint.y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
            ctx.closePath();
        }

        this.#previousPoint = point;
    }

    /**
     * @summary Add an arrow to the arrows of mouse gesture.
     * @param {string} arrow 
     */
    addArrow(arrow) {
        this.#arrows += arrow;
        this.#arrowsElement.innerText = this.#arrows;
    }

    /**
     * @summary Get the arrows of mouse gesture.
     * @return {string}
     */
    get arrows() {
        return this.#arrows;
    }
}

/**
 * @summary Mouse gesture controller for the options page.
 */
class MouseGestureController {
    /**
     * @type {ExtensionOptions | undefined}
     */
    #options = undefined;

    /**
     * @type {OptionGestureElements | undefined}
     */
    #elements = undefined;

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
    #finished = false;

    /**
     * @type {boolean}
     */
    #leftButtonDown = false;

    /**
     * @constructor
     */
    constructor() {
        this.on = {
            contextmenu: this.onContextMenu.bind(this),
            mousedown: this.onMouseDown.bind(this),
            mousemove: this.onMouseMove.bind(this),
            mouseup: this.onMouseUp.bind(this),
        }
    }

    /**
     * @summary Start the mouse gesture controller.
     * @param {ExtensionOptions} options 
     */
    start(options) {
        this.#options = options;
        this.#elements = new OptionGestureElements(options, chrome.i18n.getMessage('optionsAddMouseGestureDescription'));
        this.#elements.start(document.body);

        window.addEventListener('contextmenu', this.on.contextmenu, false);
        window.addEventListener('mousedown', this.on.mousedown, false);
        window.addEventListener('mousemove', this.on.mousemove, false);
        window.addEventListener('mouseup', this.on.mouseup, false);
    }

    /**
     * @summary End the mouse gesture controller.
     */
    end() {
        this.#finished = true;
        window.removeEventListener('mousedown', this.on.mousedown, false);
        window.removeEventListener('mousemove', this.on.mousemove, false);
        window.removeEventListener('mouseup', this.on.mouseup, false);

        if (this.#elements) {
            this.#elements.end();
        }
    }

    /**
     * @summary Handle the context menu event.
     * @param {MouseEvent} event 
     */
    onContextMenu(event) {
        event.preventDefault();
        if (this.#finished) {
            window.removeEventListener('contextmenu', this.on.contextmenu, false);
        }
    }

    /**
     * @summary Handle the mouse down event.
     * @param {MouseEvent} event 
     */
    onMouseDown(event) {
        if ((event.buttons & 2) !== 0) {
            const point = { x: event.clientX, y: event.clientY };
            this.#elements.drawLine(point);
            this.#previousPoint = point;

            if ((event.buttons & 1) !== 0) {
                this.#leftButtonDown = true;
            }
        }
    }

    /**
     * @summary Handle the mouse move event.
     * @param {MouseEvent} event 
     */
    onMouseMove(event) {
        const strokeLength = this.#options.mouseGestureStrokeLength;

        if ((event.buttons & 2) === 2 && this.#previousPoint) {
            const point = { x: event.clientX, y: event.clientY };
            this.#elements.drawLine(point);

            const diffX = point.x - this.#previousPoint.x;
            const diffY = point.y - this.#previousPoint.y;
            const distanceSquare = diffX * diffX + diffY * diffY;

            if (strokeLength * strokeLength <= distanceSquare) {
                this.#previousPoint = point;

                const direction = computeDirection(diffX, diffY);
                if (direction) {
                    if (direction !== this.#previousDirection) {
                        this.#elements.addArrow(direction);
                    }
                    this.#previousDirection = direction;
                }
            }
        }
    }

    /**
     * @summary Handle the mouse up event.
     * @param {MouseEvent} event 
     */
    onMouseUp(event) {
        if (((event.buttons & 1) === 0) && this.#previousPoint && this.#leftButtonDown) {
            this.#elements.addArrow('Click ');
            this.#previousPoint = { x: event.clientX, y: event.clientY };
            this.#previousDirection = undefined;
            this.#leftButtonDown = false;
        }

        if ((event.button === 2) && this.#previousPoint) {
            const arrows = this.#elements.arrows;
            if (arrows !== undefined && arrows !== '') {
                const action = this.#options.getGestureAction(arrows);

                const backgroundElement = document.getElementById('background');
                backgroundElement.style.visibility = 'visible';
                const generatedGestureElement = document.getElementById('generated-gesture');
                generatedGestureElement.innerText = arrows;
                const selectActionElement = document.getElementById('select-action');
                selectActionElement.innerText = '';
                appendGestureActionOptionsToSelectElement(this.#options, selectActionElement, action);
                translate(selectActionElement);

                document.getElementById('select-action-add')
                    .addEventListener('click', () => {
                        (async () => {
                            await this.#options.upsertGesture(arrows, selectActionElement.value);
                            window.location.reload();
                        })();
                    });

                document.getElementById('select-action-cencel')
                    .addEventListener('click', (event) => {
                        backgroundElement.style.visibility = 'hidden';
                        event.preventDefault();
                    });
            }

            this.end();
        }
    }
}

/**
 * @summary Append gesture action options to select element.
 * @param {ExtensionOptions} options 
 * @param {HTMLElement} selectElement 
 * @param {string} selectedOption 
 */
function appendGestureActionOptionsToSelectElement(options, selectElement, selectedOption) {
    const actions = [''].concat(Object.keys(getGestureActions()));
    for (const action of actions) {
        const optionElement = document.createElement('option');
        optionElement.value = action;
        optionElement.dataset.i18n = action || 'optionsSelectOptionNone';
        if (selectedOption === action) {
            optionElement.selected = true;
        }
        selectElement.appendChild(optionElement);
    }

    // Custom URL
    if (Object.prototype.toString.call(options.customUrlSettings) === '[object Array]') {
        for (const customUrl of options.customUrlSettings) {
            const optionElement = document.createElement('option');
            optionElement.value = `customurl:${customUrl.id}`;
            optionElement.innerText = `${chrome.i18n.getMessage('openCustomUrl')}:${customUrl.id}`;
            if (selectedOption === optionElement.value) {
                optionElement.selected = true;
            }
            selectElement.appendChild(optionElement);
        }
    }
}

/**
 * @summary Render the options page.
 * @param {ExtensionOptions} options 
 */
function render(options) {
    renderResetButton(options);
    renderWheelActionOptions(options);
    renderMouseGestureOptions(options);
    renderRockerGestureOptions(options);
    renderCustomUrlOptions(options);
    renderAppearanceOptions(options);
    renderDisableExtensionOptions(options);
    renderImportExportOptions(options);
    renderHints(options);
}

/**
 * @summary Render the reset button.
 */
function renderResetButton() {
    const resetButtonElement = document.getElementById('reset-button');
    resetButtonElement.addEventListener('click', (async () => {
        await chrome.storage.local.remove('options');
        window.location.reload();
    }));
}

/**
 * @summary Render the wheel action options.
 * @param {ExtensionOptions} options 
 */
function renderWheelActionOptions(options) {
    const enabledWheelActionElement = document.getElementById('enabled-wheel-action');
    enabledWheelActionElement.checked = options.enabledWheelAction;
    enabledWheelActionElement.addEventListener('click', () => {
        const selects = document.getElementById('wheel-action-table').querySelectorAll('select');
        for (const element of selects) {
            element.disabled = !enabledWheelActionElement.checked;
        }

        options.setEnabledWheelAction(enabledWheelActionElement.checked);
    });

    const selectRightClickWheelUpElement = document.getElementById('select-right-click-wheel-up');
    appendGestureActionOptionsToSelectElement(options, selectRightClickWheelUpElement, options.rightButtonAndWheelUp);
    selectRightClickWheelUpElement.addEventListener('change', () => {
        (async () => {
            await options.setRightClickWheelUpAction(selectRightClickWheelUpElement.value);
        })();
    });

    const selectRightClickWheelDownElement = document.getElementById('select-right-click-wheel-down');
    appendGestureActionOptionsToSelectElement(options, selectRightClickWheelDownElement, options.rightButtonAndWheelDown);
    selectRightClickWheelDownElement.addEventListener('change', () => {
        (async () => {
            await options.setRightClickWheelDownAction(selectRightClickWheelDownElement.value);
        })();
    });
}

/**
 * @summary Render the mouse gesture options.
 * @param {ExtensionOptions} options 
 */
function renderMouseGestureOptions(options) {
    const enabledMouseGestureElement = document.getElementById('enabled-mouse-gesture');
    enabledMouseGestureElement.checked = options.enabledMouseGesture;
    enabledMouseGestureElement.addEventListener('click', () => {
        const gestureOptionElements = document.getElementById('mouse-gesture-table').querySelectorAll('select, button');
        for (const element of gestureOptionElements) {
            element.disabled = !enabledMouseGestureElement.checked;
        }

        const rightDoubleClickToContextMenuElement = document.getElementById('right-double-click-to-context-menu');
        rightDoubleClickToContextMenuElement.disabled = !enabledMouseGestureElement.checked;

        const mouseGestureStrokeLengthElement = document.getElementById('gesture-stroke-length');
        mouseGestureStrokeLengthElement.disabled = !enabledMouseGestureElement.checked;

        const previousTabHistorySizeElement = document.getElementById('previous-tab-hisotry-size');
        previousTabHistorySizeElement.disabled = !enabledMouseGestureElement.checked;

        options.setEnabledMouseGesture(enabledMouseGestureElement.checked);
    });

    const gestureTableBodyElement = document.getElementById('gestures');

    if (Object.prototype.toString.call(options.gestureSettings) === '[object Array]') {
        for (const gestureSetting of options.gestureSettings) {
            const rowElement = document.createElement('tr');

            const jestureColumnElement = document.createElement('td');
            jestureColumnElement.innerText = gestureSetting.gesture;
            jestureColumnElement.style.fontFamily = 'BIZ UDPGothic';

            const actionColumnElement = document.createElement('td');
            const selectActionElement = document.createElement('select');
            actionColumnElement.appendChild(selectActionElement);
            appendGestureActionOptionsToSelectElement(options, selectActionElement, gestureSetting.action);
            selectActionElement.addEventListener('change', () => {
                (async () => {
                    await options.upsertGesture(gestureSetting.gesture, selectActionElement.value);
                })();
            });

            const operationColumnElement = document.createElement('td');
            const deleteButtonElement = document.createElement('button');
            operationColumnElement.appendChild(deleteButtonElement);
            deleteButtonElement.dataset.i18n = 'strDelete';
            deleteButtonElement.addEventListener('click', () => {
                (async () => {
                    await options.removeGesture(gestureSetting.gesture);
                    gestureTableBodyElement.removeChild(rowElement);
                })();
            });

            gestureTableBodyElement.appendChild(rowElement);
            rowElement.appendChild(jestureColumnElement);
            rowElement.appendChild(actionColumnElement);
            rowElement.appendChild(operationColumnElement);
        }
    }

    const addRowElement = document.createElement('tr');
    const addColumnElement = document.createElement('td');
    const addButtonElement = document.createElement('button');
    addButtonElement.dataset.i18n = 'optionsAdd';
    addButtonElement.addEventListener('click', () => {
        (new MouseGestureController()).start(options);
    });

    addColumnElement.appendChild(addButtonElement);
    addRowElement.appendChild(addColumnElement);
    gestureTableBodyElement.appendChild(addRowElement);

    const gestureOptionElements = document.getElementById('mouse-gesture-table').querySelectorAll('select, button');
    for (const element of gestureOptionElements) {
        element.disabled = !enabledMouseGestureElement.checked;
    }

    const rightDoubleClickToContextMenuElement = document.getElementById('right-double-click-to-context-menu');
    rightDoubleClickToContextMenuElement.checked = options.rightDoubleClickToContextMenu;
    rightDoubleClickToContextMenuElement.disabled = !options.enabledMouseGesture;
    rightDoubleClickToContextMenuElement.addEventListener('click', () => {
        options.setRightDoubleClickToContextMenu(rightDoubleClickToContextMenuElement.checked);
    });

    const mouseGestureStrokeLengthElement = document.getElementById('gesture-stroke-length');
    mouseGestureStrokeLengthElement.value = options.mouseGestureStrokeLength;
    mouseGestureStrokeLengthElement.disabled = !options.enabledMouseGesture;
    mouseGestureStrokeLengthElement.addEventListener('change', async () => {
        const strokeLength = parseInt(mouseGestureStrokeLengthElement.value);
        if (strokeLength) {
            options.setMouseGestureStrokeLength(strokeLength);
        }
    });
    mouseGestureStrokeLengthElement.addEventListener('input', () => {
        mouseGestureStrokeLengthElement.value = mouseGestureStrokeLengthElement.value.slice(0, 3);
    });

    const previousTabHistorySizeElement = document.getElementById('previous-tab-history-size');
    previousTabHistorySizeElement.value = options.previousTabHistorySize;
    previousTabHistorySizeElement.disabled = !options.enabledMouseGesture;
    previousTabHistorySizeElement.addEventListener('change', async () => {
        const size = parseInt(previousTabHistorySizeElement.value);
        if (size) {
            options.setPreviousTabHistorySize(size);
        }
    });
    previousTabHistorySizeElement.addEventListener('input', () => {
        previousTabHistorySizeElement.value = previousTabHistorySizeElement.value.slice(0, 4);
    });
}

/**
 * @summary Render the rocker gesture options.
 * @param {ExtensionOptions} options 
 */
function renderRockerGestureOptions(options) {
    const selectRockerGestureLeftRightElement = document.getElementById('select-rocker-gesture-left-right');
    appendGestureActionOptionsToSelectElement(options, selectRockerGestureLeftRightElement, options.rockerGestureLeftRight);
    selectRockerGestureLeftRightElement.addEventListener('change', () => {
        options.setRockerGestureLeftRight(selectRockerGestureLeftRightElement.value);
    });

    const selectRockerGestureRightLeftElement = document.getElementById('select-rocker-gesture-right-left');
    appendGestureActionOptionsToSelectElement(options, selectRockerGestureRightLeftElement, options.rockerGestureRightLeft);
    selectRockerGestureRightLeftElement.addEventListener('change', () => {
        options.setRockerGestureRightLeft(selectRockerGestureRightLeftElement.value);
    });
}

/**
 * @summary Render the custom URL options.
 * @param {ExtensionOptions} options 
 */
function renderCustomUrlOptions(options) {
    const customUrlOptionsElement = document.getElementById('customUrlOptions');

    if (Object.prototype.toString.call(options.customUrlSettings) === '[object Array]') {
        for (const setting of options.customUrlSettings) {
            const rowElement = document.createElement('tr');

            const idColumnElement = document.createElement('td');
            const idInputElement = document.createElement('input');
            idInputElement.value = setting.id;
            idInputElement.size = 12;
            idColumnElement.appendChild(idInputElement);

            const urlColumnElement = document.createElement('td');
            const urlInputElement = document.createElement('input');
            urlInputElement.value = setting.customUrl;
            urlInputElement.size = 48;
            urlColumnElement.appendChild(urlInputElement);

            const openInNewTabColumnElement = document.createElement('td');
            const openInNewTabInputElement = document.createElement('input');
            openInNewTabInputElement.type = 'checkbox';
            openInNewTabInputElement.checked = setting.openInNewTab;
            openInNewTabColumnElement.appendChild(openInNewTabInputElement);

            const operationColumnElement = document.createElement('td');
            const deleteButtonElement = document.createElement('button');
            operationColumnElement.appendChild(deleteButtonElement);
            deleteButtonElement.dataset.i18n = 'strDelete';
            deleteButtonElement.addEventListener('click', () => {
                (async () => {
                    customUrlOptionsElement.removeChild(rowElement);
                })();
            });

            customUrlOptionsElement.appendChild(rowElement);
            rowElement.appendChild(idColumnElement);
            rowElement.appendChild(urlColumnElement);
            rowElement.appendChild(openInNewTabColumnElement);
            rowElement.appendChild(operationColumnElement);
        }
    }

    const customUrlOptionsControlsElement = document.getElementById('customUrlOptionsControls');

    const addButtonElement = document.createElement('button');
    addButtonElement.dataset.i18n = 'optionsAdd';
    addButtonElement.addEventListener('click', () => {
        const rowElement = document.createElement('tr');

        const idColumnElement = document.createElement('td');
        const idInputElement = document.createElement('input');
        idInputElement.size = 12;
        idColumnElement.appendChild(idInputElement);

        const urlColumnElement = document.createElement('td');
        const urlInputElement = document.createElement('input');
        urlInputElement.size = 48;
        urlColumnElement.appendChild(urlInputElement);

        const openInNewTabColumnElement = document.createElement('td');
        const openInNewTabInputElement = document.createElement('input');
        openInNewTabInputElement.type = 'checkbox';
        openInNewTabInputElement.checked = true;
        openInNewTabColumnElement.appendChild(openInNewTabInputElement);

        const operationColumnElement = document.createElement('td');
        const deleteButtonElement = document.createElement('button');
        operationColumnElement.appendChild(deleteButtonElement);
        deleteButtonElement.dataset.i18n = 'strDelete';
        deleteButtonElement.addEventListener('click', () => {
            (async () => {
                customUrlOptionsElement.removeChild(rowElement);
            })();
        });

        customUrlOptionsElement.appendChild(rowElement);
        rowElement.appendChild(idColumnElement);
        rowElement.appendChild(urlColumnElement);
        rowElement.appendChild(openInNewTabColumnElement);
        rowElement.appendChild(operationColumnElement);

        translate(customUrlOptionsElement);
    });

    customUrlOptionsControlsElement.appendChild(addButtonElement);

    const saveButtonElement = document.createElement('button');
    saveButtonElement.dataset.i18n = 'optionsSave';
    saveButtonElement.style.margin = '1em';
    saveButtonElement.addEventListener('click', () => {
        saveCustomUrl(options);
    });
    customUrlOptionsControlsElement.appendChild(saveButtonElement);
}

/**
 * @summary Save the custom URL options.
 * @param {ExtensionOptions} options 
 */
function saveCustomUrl(options) {
    const customUrlSettings = [];
    const rowElements = document.querySelectorAll('#customUrlOptions > *')

    for (const row of rowElements) {
        const id = row.children[0].children[0].value;
        const customUrl = row.children[1].children[0].value;
        const checked = row.children[2].children[0].checked;

        // Ignore empty rows
        if (id.length === 0 && customUrl.length === 0) {
            continue;
        }

        // ID must be 1 character or more
        if (id.length === 0) {
            window.alert(chrome.i18n.getMessage('optionsCustomUrlErrorMessageIdMustBeSpecified'));
            row.children[0].children[0].focus();
            return;
        }

        // ID must be duplicated
        if (customUrlSettings.filter((option) => option.id === id).length !== 0) {
            window.alert(chrome.i18n.getMessage('optionsCustomUrlErrorMessageIdMustBeUnique'));
            row.children[0].children[0].focus();
            return;
        }

        customUrlSettings.push({
            id: id,
            customUrl: customUrl,
            openInNewTab: checked,
        });
    }

    (async () => {
        await options.setCustomUrlSettings(customUrlSettings);
        window.alert(chrome.i18n.getMessage('messageSucceededInSave'));
        window.location.reload();
    })();
}

/**
 * @summary Render the appearance options.
 * @param {ExtensionOptions} options 
 */
function renderAppearanceOptions(options) {
    const lineColorElement = document.getElementById('color-line');
    lineColorElement.value = options.gestureLineColor;
    lineColorElement.disabled = options.hideGestureLine;

    const hideGestureLineElement = document.getElementById('hide-gesture-line');
    hideGestureLineElement.checked = options.hideGestureLine;
    hideGestureLineElement.addEventListener('change', () => {
        lineColorElement.disabled = hideGestureLineElement.checked;
    });

    const arrowColorElement = document.getElementById('color-arrow');
    arrowColorElement.value = options.gestureArrowColor;
    arrowColorElement.disabled = options.hideGestureArrow;

    const arrowFontSizeElement = document.getElementById('font-size-arrow');
    arrowFontSizeElement.value = options.gestureArrowFontSize;
    arrowFontSizeElement.disabled = options.hideGestureArrow;
    arrowFontSizeElement.addEventListener('input', () => {
        arrowFontSizeElement.value = arrowFontSizeElement.value.slice(0, 3);
    });

    const hideGestureArrowElement = document.getElementById('hide-gesture-arrow');
    hideGestureArrowElement.checked = options.hideGestureArrow;
    hideGestureArrowElement.addEventListener('change', () => {
        arrowColorElement.disabled = hideGestureArrowElement.checked;
        arrowFontSizeElement.disabled = hideGestureArrowElement.checked;
    });

    const textColorElement = document.getElementById('color-text');
    textColorElement.value = options.gestureFontColor;
    textColorElement.disabled = options.hideGestureText;

    const textFontSizeElement = document.getElementById('font-size-text');
    textFontSizeElement.value = options.gestureTextFontSize;
    textFontSizeElement.disabled = options.hideGestureArrow;
    textFontSizeElement.addEventListener('input', () => {
        textFontSizeElement.value = textFontSizeElement.value.slice(0, 3);
    });

    const hideGestureTextElement = document.getElementById('hide-gesture-text');
    hideGestureTextElement.checked = options.hideGestureText;
    hideGestureTextElement.addEventListener('change', () => {
        textColorElement.disabled = hideGestureTextElement.checked;
        textFontSizeElement.disabled = hideGestureTextElement.checked;
    });

    const backgroundColorElement = document.getElementById('color-background');
    backgroundColorElement.value = options.gestureBackgroundColor;
    backgroundColorElement.disabled = options.hideGestureBackground;

    const hideGestureBackgroundElement = document.getElementById('hide-gesture-background');
    hideGestureBackgroundElement.checked = options.hideGestureBackground;
    hideGestureBackgroundElement.addEventListener('change', () => {
        backgroundColorElement.disabled = hideGestureBackgroundElement.checked;
    });

    const saveButtonElement = document.getElementById('color-save');
    saveButtonElement.addEventListener('click', () => {
        (async () => {
            const lineColor = lineColorElement.value;
            const hideLine = hideGestureLineElement.checked;
            const arrowColor = arrowColorElement.value;
            const arrowSize = parseInt(arrowFontSizeElement.value);
            const hideArrow = hideGestureArrowElement.checked;
            const textColor = textColorElement.value;
            const textSize = parseInt(textFontSizeElement.value);
            const hideText = hideGestureTextElement.checked;
            const backgroundColor = backgroundColorElement.value;
            const hideBackground = hideGestureBackgroundElement.checked;

            await options.setGestureAppearance(lineColor, hideLine, arrowColor, arrowSize, hideArrow, textColor, textSize, hideText, backgroundColor, hideBackground);

            window.alert(chrome.i18n.getMessage('messageSucceededInSave'));
            window.location.reload();
        })();
    });
}

/**
 * @summary Render the disable extension options.
 * @param {ExtensionOptions} options 
 */
function renderDisableExtensionOptions(options) {
    const disableExtensionOptionsElement = document.getElementById('disableExtensionOptions');

    let disableExtensionSettings = options.disableExtensionSettings;
    if ((Object.prototype.toString.call(disableExtensionSettings) !== '[object Array]') || (disableExtensionSettings.length === 0)) {
        disableExtensionSettings = [{ method: 'prefixMatch', value: '' }];
    }

    for (const setting of disableExtensionSettings) {
        const rowElement = document.createElement('tr');

        const valueColumnElement = document.createElement('td');
        const valueInputElement = document.createElement('input');
        valueInputElement.value = setting.value;
        valueInputElement.size = 48;
        valueColumnElement.appendChild(valueInputElement);

        const methodColumnElement = document.createElement('td');
        const methodSelectElement = document.createElement('select');
        methodSelectElement.addEventListener('change', (event) => {
            switch (event.target.value) {
                case 'regexp':
                    valueInputElement.placeholder = 'https://example.com/.*';
                    break;
                case 'include':
                    valueInputElement.placeholder = 'example.com';
                    break;
                default:
                    valueInputElement.placeholder = 'https://example.com/';
                    break;
            }
        });
        methodColumnElement.appendChild(methodSelectElement);

        const prefixMatchOptionElement = document.createElement('option');
        prefixMatchOptionElement.value = 'prefixMatch';
        prefixMatchOptionElement.dataset.i18n = 'optionsDisableExtensionMethodPrefixMatch';
        if ((setting.method === prefixMatchOptionElement.value) || !setting.method) {
            prefixMatchOptionElement.selected = true;
            valueInputElement.placeholder = 'https://example.com/';
        }
        methodSelectElement.appendChild(prefixMatchOptionElement);

        const includeOptionElement = document.createElement('option');
        includeOptionElement.value = 'include';
        includeOptionElement.dataset.i18n = 'optionsDisableExtensionMethodInclude';
        if ((setting.method === includeOptionElement.value) || !setting.method) {
            includeOptionElement.selected = true;
            valueInputElement.placeholder = 'example.com';
        }
        methodSelectElement.appendChild(includeOptionElement);

        const RegularExpressionOptionElement = document.createElement('option');
        RegularExpressionOptionElement.value = 'regexp';
        RegularExpressionOptionElement.dataset.i18n = 'optionsDisableExtensionMethodRegexp';
        if (setting.method === RegularExpressionOptionElement.value) {
            RegularExpressionOptionElement.selected = true;
            valueInputElement.placeholder = 'https://example.com/.*';
        }
        methodSelectElement.appendChild(RegularExpressionOptionElement);

        const operationColumnElement = document.createElement('td');
        const deleteButtonElement = document.createElement('button');
        operationColumnElement.appendChild(deleteButtonElement);
        deleteButtonElement.dataset.i18n = 'strDelete';
        deleteButtonElement.addEventListener('click', () => {
            (async () => {
                disableExtensionOptionsElement.removeChild(rowElement);
            })();
        });

        disableExtensionOptionsElement.appendChild(rowElement);
        rowElement.appendChild(methodColumnElement);
        rowElement.appendChild(valueColumnElement);
        rowElement.appendChild(operationColumnElement);
    }

    const disableExtensionOptionsControlsElement = document.getElementById('disableExtensionOptionsControls');

    const addButtonElement = document.createElement('button');
    addButtonElement.dataset.i18n = 'optionsAdd';
    addButtonElement.addEventListener('click', () => {
        const rowElement = document.createElement('tr');

        const methodColumnElement = document.createElement('td');
        const methodSelectElement = document.createElement('select');

        const valueColumnElement = document.createElement('td');
        const valueInputElement = document.createElement('input');
        valueInputElement.size = 48;
        valueColumnElement.appendChild(valueInputElement);

        methodColumnElement.appendChild(methodSelectElement);
        methodSelectElement.addEventListener('change', (event) => {
            switch (event.target.value) {
                case 'regexp':
                    valueInputElement.placeholder = 'https://example.com/.*';
                    break;
                case 'include':
                    valueInputElement.placeholder = 'example.com';
                    break;
                default:
                    valueInputElement.placeholder = 'https://example.com/';
                    break;
            }
        });

        const prefixMatchOptionElement = document.createElement('option');
        prefixMatchOptionElement.value = 'prefixMatch';
        prefixMatchOptionElement.dataset.i18n = 'optionsDisableExtensionMethodPrefixMatch';
        prefixMatchOptionElement.selected = true;
        valueInputElement.placeholder = 'https://example.com/';
        methodSelectElement.appendChild(prefixMatchOptionElement);

        const includeOptionElement = document.createElement('option');
        includeOptionElement.value = 'include';
        includeOptionElement.dataset.i18n = 'optionsDisableExtensionMethodInclude';
        methodSelectElement.appendChild(includeOptionElement);

        const RegularExpressionOptionElement = document.createElement('option');
        RegularExpressionOptionElement.value = 'regexp';
        RegularExpressionOptionElement.dataset.i18n = 'optionsDisableExtensionMethodRegexp';
        methodSelectElement.appendChild(RegularExpressionOptionElement);

        const operationColumnElement = document.createElement('td');
        const deleteButtonElement = document.createElement('button');
        operationColumnElement.appendChild(deleteButtonElement);
        deleteButtonElement.dataset.i18n = 'strDelete';
        deleteButtonElement.addEventListener('click', () => {
            (async () => {
                disableExtensionOptionsElement.removeChild(rowElement);
            })();
        });

        disableExtensionOptionsElement.appendChild(rowElement);
        rowElement.appendChild(methodColumnElement);
        rowElement.appendChild(valueColumnElement);
        rowElement.appendChild(operationColumnElement);

        translate(disableExtensionOptionsElement);
    });

    disableExtensionOptionsControlsElement.appendChild(addButtonElement);

    const saveButtonElement = document.createElement('button');
    saveButtonElement.dataset.i18n = 'optionsSave';
    saveButtonElement.style.margin = '1em';
    saveButtonElement.addEventListener('click', () => {
        saveDisableExtension(options);
    });
    disableExtensionOptionsControlsElement.appendChild(saveButtonElement);
}

/**
 * @summary Save the disable extension options.
 * @param {ExtensionOptions} options 
 */
function saveDisableExtension(options) {
    const disableExtensionSettings = [];
    const rowElements = document.querySelectorAll('#disableExtensionOptions > *')

    for (const row of rowElements) {
        const method = row.children[0].children[0].value;
        const value = row.children[1].children[0].value;

        // 未入力の行は無視
        if (value.length === 0) {
            continue;
        }

        // 正規表現が不正な場合はエラー
        if (method === 'regexp') {
            try {
                new RegExp(value);
            }
            catch (e) {
                window.alert(`${chrome.i18n.getMessage('optionsDisbleExtensionErrorMessageInvalidRegExp')}\n${e}`);
                row.children[1].children[0].focus();
                row.children[1].children[0].setSelectionRange(0, value.length);
                return;
            }
        }

        disableExtensionSettings.push({
            method: method,
            value: value,
        });
    }

    (async () => {
        await options.setDisableExtensionSettings(disableExtensionSettings);
        window.alert(chrome.i18n.getMessage('messageSucceededInSave'));
        window.location.reload();
    })();
}

/**
 * @summary Render the import/export options.
 * @param {ExtensionOptions} options 
 */
function renderImportExportOptions(options) {
    // export button
    const copyToClipboardButtonElement = document.getElementById('import-export-copy-to-clipboard');
    copyToClipboardButtonElement.addEventListener('click', () => {
        navigator.clipboard.writeText(JSON.stringify(options.options));
        alert(chrome.i18n.getMessage('messageCopied'));
    });

    const saveButtonElement = document.getElementById('import-export-save');
    saveButtonElement.addEventListener('click', () => {
        (async () => {
            const textareaElement = document.getElementById('import-export-textarea');
            try {
                const newOptions = JSON.parse(textareaElement.value);

                if (Object.prototype.toString.call(newOptions) === '[object Object]') {
                    await options.setOptions(newOptions);
                    await options.createDefaultCustomUrlSettingsIfNotExist();
                    window.alert(chrome.i18n.getMessage('messageSucceededInSave'));
                    window.location.reload();
                }
                else {
                    window.alert(chrome.i18n.getMessage('importErrorMessgeOptionsMustBeObject'));
                }
            }
            catch (error) {
                window.alert(error);
            }
        })();
    });
}

/**
 * @summary Render the hints.
 * @param {ExtensionOptions} options 
 */
function renderHints(options) {
    const hintElement = document.getElementById('hint');
    if (options.hideHintPermanently) {
        hintElement.style.display = 'none';
    }

    const hideHintElement = document.getElementById('hideHintPermanently');
    hideHintElement.addEventListener('click', (event) => {
        options.setHideHintPermanently(true);
        hintElement.style.display = 'none';
        event.preventDefault();
    });
}

/**
 * @summary Translate the HTML elements.
 * @param {HTMLElement} element 
 */
function translate(element) {
    const targets = element.querySelectorAll('[data-i18n]');
    for (const target of targets) {
        if (target.dataset.i18n) {
            if (target.dataset.i18n) {
                target.innerText = chrome.i18n.getMessage(target.dataset.i18n);
            }
            else {
                console.log('message not found: ', target);
            }
        }
    }
}

(async () => {
    let options = new ExtensionOptions();
    await options.loadFromStrageLocal();
    await options.createDefaultCustomUrlSettingsIfNotExist();
    render(options);
    translate(document.body);
})();
