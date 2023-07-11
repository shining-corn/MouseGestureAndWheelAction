class OptionGestureElements {
    constructor(gestureDescription) {
        this.previousPoint = undefined;
        this.arrows = '';
        this.parentElement = undefined;
        this.createElements(gestureDescription);
    }

    createElements(description) {
        this.conainerElement = document.createElement('div');
        this.conainerElement.style.width = '100vw';
        this.conainerElement.style.height = '100vh';
        this.conainerElement.style.position = 'fixed';
        this.conainerElement.style.left = '0px';
        this.conainerElement.style.top = '0px';
        this.conainerElement.style.zIndex = 16777270;
        this.conainerElement.style.margin = '0px';
        this.conainerElement.style.padding = '0px';
        this.conainerElement.style.border = 'none';
        this.conainerElement.style.color = 'rgba(239, 239, 255, 0.9)';
        this.conainerElement.style.backgroundColor = 'rgba(0, 0, 32, 0.9)';

        this.centerBox = document.createElement('div');
        this.conainerElement.appendChild(this.centerBox);
        this.centerBox.style.top = '0';
        this.centerBox.style.bottom = '0';
        this.centerBox.style.left = '0';
        this.centerBox.style.right = '0';
        this.centerBox.style.margin = 'auto';
        this.centerBox.style.padding = '0px';
        this.centerBox.style.border = 'none';
        this.centerBox.style.position = 'absolute';
        this.centerBox.style.maxWidth = '100vw';
        this.centerBox.style.width = 'fit-content';
        this.centerBox.style.height = 'fit-content';
        this.centerBox.style.textAlign = 'center';
        this.centerBox.style.backgroundColor = 'transparent';

        this.descriptionElement = document.createElement('span');
        this.centerBox.appendChild(this.descriptionElement);
        this.descriptionElement.style.width = 'fit-content';
        this.descriptionElement.style.height = 'fit-content';
        this.descriptionElement.style.backgroundColor = 'transparent';
        this.descriptionElement.innerText = description;

        this.arrowsElement = document.createElement('div');
        this.centerBox.appendChild(this.arrowsElement);
        this.arrowsElement.style.fontWeight = 'bold';
        this.arrowsElement.style.padding = '24px';
        this.arrowsElement.style.left = '0';
        this.arrowsElement.style.right = '0';
        this.arrowsElement.style.margin = 'auto';
        this.arrowsElement.style.border = 'none';
        this.arrowsElement.style.fontSize = '64px';
        this.arrowsElement.style.lineHeight = '1';
        this.arrowsElement.style.fontFamily = 'monospace';
        this.arrowsElement.style.maxWidth = 'calc(100vw - 64px)';
        this.arrowsElement.style.width = 'fit-content';
        this.arrowsElement.style.height = 'fit-content';
        this.arrowsElement.style.overflowWrap = 'anywhere';
        this.arrowsElement.style.backgroundColor = 'transparent';

        this.canvasElement = document.createElement('canvas');
        this.conainerElement.appendChild(this.canvasElement);
        this.canvasElement.style.zIndex = 16777271;
        this.canvasElement.width = document.documentElement.clientWidth;
        this.canvasElement.height = document.documentElement.clientHeight;
        this.canvasElement.style.backgroundColor = 'transparent';
    }

    start(parentElement) {
        parentElement.appendChild(this.conainerElement);
        this.parentElement = parentElement;
    }

    end() {
        if (this.conainerElement) {
            this.parentElement.removeChild(this.conainerElement);
        }
    }

    drawLine(point) {
        if (this.previousPoint) {
            const ctx = this.canvasElement.getContext('2d');
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#408040';
            ctx.beginPath();
            ctx.moveTo(this.previousPoint.x, this.previousPoint.y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
            ctx.closePath();
        }

        this.previousPoint = point;
    }

    addArrow(arrow) {
        this.arrows += arrow;
        this.arrowsElement.innerText = this.arrows;
    }
}

class MouseGestureController {
    constructor() {
        this.elements = undefined;
        this.previousPoint = undefined;
        this.previousDirection = undefined;
        this.finished = false;

        this.on = {
            contextmenu: this.onContextMenu.bind(this),
            mousedown: this.onMouseDown.bind(this),
            mousemove: this.onMouseMove.bind(this),
            mouseup: this.onMouseUp.bind(this),
        }
    }

    start(options) {
        this.options = options;
        this.elements = new OptionGestureElements(chrome.i18n.getMessage('optionsAddMouseGestureDescription'));
        this.elements.start(document.body);

        window.addEventListener('contextmenu', this.on.contextmenu, false);
        window.addEventListener('mousedown', this.on.mousedown, false);
        window.addEventListener('mousemove', this.on.mousemove, false);
        window.addEventListener('mouseup', this.on.mouseup, false);
    }

    end() {
        this.finished = true;
        window.removeEventListener('mousedown', this.on.mousedown, false);
        window.removeEventListener('mousemove', this.on.mousemove, false);
        window.removeEventListener('mouseup', this.on.mouseup, false);

        if (this.elements) {
            this.elements.end();
        }
    }

    onContextMenu(event) {
        event.preventDefault();
        if (this.finished) {
            window.removeEventListener('contextmenu', this.on.contextmenu, false);
        }
    }

    onMouseDown(event) {
        if ((event.buttons & 2) === 2) {
            const point = { x: event.clientX, y: event.clientY };
            this.elements.drawLine(point);
            this.previousPoint = point;
        }
    }

    onMouseMove(event) {
        const MINIMUM_DISTANCE = 16;

        if ((event.buttons & 2) === 2 && this.previousPoint) {
            const point = { x: event.clientX, y: event.clientY };
            this.elements.drawLine(point);

            const diffX = point.x - this.previousPoint.x;
            const diffY = point.y - this.previousPoint.y;
            const distanceSquare = diffX * diffX + diffY * diffY;

            if (MINIMUM_DISTANCE * MINIMUM_DISTANCE <= distanceSquare) {
                this.previousPoint = point;

                const direction = computeDirection(diffX, diffY);
                if (direction) {
                    if (direction !== this.previousDirection) {
                        this.elements.addArrow(direction);
                    }
                    this.previousDirection = direction;
                }
            }
        }
    }

    onMouseUp(event) {
        if (event.button === 2 && this.previousPoint) {
            const arrows = this.elements.arrows;
            if (arrows !== '') {
                const action = this.options.getGestureAction(arrows) || '';

                const backgroundElement = document.getElementById('background');
                backgroundElement.style.visibility = 'visible';
                const generatedGestureElement = document.getElementById('generated-gesture');
                generatedGestureElement.innerText = arrows;
                const selectActionElement = document.getElementById('select-action');
                selectActionElement.innerText = '';
                appendGestureActionOptonsToSelectElement(selectActionElement, action);
                translate(selectActionElement);

                document.getElementById('select-action-add')
                    .addEventListener('click', () => {
                        (async () => {
                            await this.options.upsertGesture(arrows, selectActionElement.value);
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

function translate(element) {
    const targets = element.querySelectorAll('[data-i18n]');
    for (const target of targets) {
        if (target.dataset.i18n) {
            if (target.dataset.i18n) {
                target.innerText = chrome.i18n.getMessage(target.dataset.i18n);
            }
            else {
                console.log("message not found: ", target);
            }
        }
    }
}

function appendGestureActionOptonsToSelectElement(selectElement, selectedOption) {
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
}

function render(options) {
    const enabledWheelActionElement = document.getElementById('enabled-wheel-action');
    enabledWheelActionElement.checked = options.enabledWheelAction;
    enabledWheelActionElement.addEventListener('click', () => {
        const selects = document.getElementById('wheel-action-table').querySelectorAll('select');
        for (const element of selects) {
            element.disabled = !enabledWheelActionElement.checked;
        }

        options.changeEnabledWheelAction(enabledWheelActionElement.checked);
    });

    const selectRightClickWheelUpElement = document.getElementById('select-right-click-wheel-up');
    appendGestureActionOptonsToSelectElement(selectRightClickWheelUpElement, options.rightButtonAndWheelUp);
    selectRightClickWheelUpElement.addEventListener('change', () => {
            (async () => {
                await options.changeRightClickWheelUpAction(selectRightClickWheelUpElement.value);
            })();
        });

    const selectRightClickWheelDownElement = document.getElementById
    ('select-right-click-wheel-down')
    appendGestureActionOptonsToSelectElement(selectRightClickWheelDownElement, options.rightButtonAndWheelDown);
    selectRightClickWheelDownElement.addEventListener('change', () => {
        (async () => {
            await options.changeRightClickWheelDownAction(selectRightClickWheelDownElement.value);
        })();
    });

    const enabledMouseGestureElement = document.getElementById('enabled-mouse-gesture');
    enabledMouseGestureElement.checked = options.enabledMouseGesture;
    enabledMouseGestureElement.addEventListener('click', () => {
        const selects = document.getElementById('mouse-gesture-table').querySelectorAll('select, button');
        for (const element of selects) {
            element.disabled = !enabledMouseGestureElement.checked;
        }

        options.changeEnabledMouseGesture(enabledMouseGestureElement.checked);
    });

    const gestureTableBodyElement = document.getElementById('gestures');

    for (const gestureSetting of options.gestureSettings) {
        const rowElement = document.createElement('tr');

        const jestureColumnElement = document.createElement('td');
        jestureColumnElement.innerText = gestureSetting.gesture;
        jestureColumnElement.style.fontFamily = 'BIZ UDPGothic';

        const actionColumnElement = document.createElement('td');
        const selectActionElement = document.createElement('select');
        actionColumnElement.appendChild(selectActionElement);
        appendGestureActionOptonsToSelectElement(selectActionElement, gestureSetting.action);
        selectActionElement.addEventListener('change', () => {
            (async () => {
                await options.upsertGesture(gestureSetting.gesture, selectActionElement.value);
            })();
        });

        const operationColumnElement = document.createElement('td');
        const deleteButtonElement = document.createElement('button');
        operationColumnElement.appendChild(deleteButtonElement);
        deleteButtonElement.dataset.i18n = 'optionsDelete';
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

    const addRowElement = document.createElement('tr');
    const addColumnElement = document.createElement('td');
    const addButtonElement = document.createElement('button');
    addButtonElement.dataset.i18n = 'optionsAdd';
    addButtonElement.addEventListener('click', () => {
        (new MouseGestureController()).start(options);
    });

    gestureTableBodyElement.appendChild(addRowElement);
    addRowElement.appendChild(addColumnElement);
    addColumnElement.appendChild(addButtonElement);

    const resetButtonElement = document.getElementById('reset-button');
    resetButtonElement.addEventListener('click', (async () => {
        await chrome.storage.local.remove('options');
        window.location.reload();
    }));
}

(async () => {
    let options = new ExtensionOption();
    await options.loadFromStrageLocal();
    render(options);
    translate(document.body);
})();
