function sendMessage(request) {
    (async () => {
        request.extensionId = chrome.runtime.id;
        await chrome.runtime.sendMessage(request);
    })();
}

const global = new class {
    constructor() {
        this.variables = {
            shouldPreventContextMenu: false
        };

        this.syncTargets = [];
        if (isInIFrame()) {
            this.registerToRootWindow();
            this.syncTargets.push(getRootWindow());
        }

        window.addEventListener('message', event => {
            if (event.data.extensionId !== chrome.runtime.id) {
                return;
            }

            switch (event.data.type) {
                case 'mouse-extension-register':
                    if (event.source) {
                        this.syncTargets.push(event.source);
                    }
                    break;
                case 'mouse-extension-sync':
                    this.variables = event.data.variables;
                    if (!isInIFrame()) {
                        this.sync();
                    }
                    break;
            }
        });
    }

    registerToRootWindow() {
        getRootWindow().postMessage({ extensionId: chrome.runtime.id, type: 'mouse-extension-register' }, '*');
    }

    sync() {
        for (const w of this.syncTargets) {
            w.postMessage(
                { extensionId: chrome.runtime.id, type: 'mouse-extension-sync', variables: this.variables },
                '*'
            );
        }
    }

    set shouldPreventContextMenu(should) {
        this.variables.shouldPreventContextMenu = should;
        this.sync();
    }

    get shouldPreventContextMenu() {
        return this.variables.shouldPreventContextMenu;
    }
}();

class GestureElements {
    constructor() {
        this.previousPoint = undefined;

        this.parentElement = document.createElement('div');
        this.canvasElement = document.createElement('canvas');

        this.parentElement.appendChild(this.canvasElement);

        this.parentElement.style.width = '100vw';
        this.parentElement.style.height = '100vh';
        this.parentElement.style.position = 'fixed';
        this.parentElement.style.left = '0px';
        this.parentElement.style.top = '0px';
        this.parentElement.style.zIndex = 16777271;
        this.parentElement.style.margin = '0px';
        this.parentElement.style.padding = '0px';
        this.parentElement.style.border = 'none';
        this.parentElement.style.backgroundColor = 'transparent';

        this.canvasElement.width = document.documentElement.clientWidth;
        this.canvasElement.height = document.documentElement.clientHeight;
        this.canvasElement.style.backgroundColor = 'transparent';
    }

    insertTo(targetElement) {
        targetElement.insertBefore(this.parentElement, null);
    }

    removeFrom(targetElement) {
        targetElement.removeChild(this.parentElement);
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

    reset() {
        if (this.previousPoint) {
            const ctx = this.canvasElement.getContext('2d');
            const element = document.documentElement;
            ctx.clearRect(0, 0, element.clientWidth, element.clientHeight);

            this.previousPoint = undefined;
            this.canvasElement.width = element.clientWidth;
            this.canvasElement.height = element.clientHeight;
        }
    }
}

class ShowArrowsElements {
    constructor(options) {
        this.options = options;
        this.arrows = '';

        this.parentElement = document.createElement('div');

        this.parentElement.style.width = '100vw';
        this.parentElement.style.height = '100vh';
        this.parentElement.style.position = 'fixed';
        this.parentElement.style.left = '0px';
        this.parentElement.style.top = '0px';
        this.parentElement.style.zIndex = 16777270;
        this.parentElement.style.margin = '0px';
        this.parentElement.style.padding = '0px';
        this.parentElement.style.border = 'none';
        this.parentElement.style.backgroundColor = 'transparent';
        this.parentElement.style.textAlign = 'center';

        this.centerBox = document.createElement('div');
        this.parentElement.appendChild(this.centerBox);
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

        this.actionNameArea = document.createElement('div');
        this.centerBox.appendChild(this.actionNameArea);
        this.actionNameArea.style.width = 'fit-content';
        this.actionNameArea.style.height = 'fit-content';
        this.actionNameArea.style.margin = '0px';
        this.actionNameArea.style.border = 'none';
        this.actionNameArea.style.padding = '8px';
        this.actionNameArea.style.fontSize = '24px';
        this.actionNameArea.style.lineHeight = '1';
        this.actionNameArea.style.fontFamily = 'BIZ UDPGothic';
        this.actionNameArea.style.color = 'rgba(239, 239, 255, 0.9)';
        this.actionNameArea.style.backgroundColor = 'rgba(0, 0, 32, 0.9)';
        this.actionNameArea.style.display = 'none';

        this.arrowArea = document.createElement('div');
        this.centerBox.appendChild(this.arrowArea);
        this.arrowArea.style.fontWeight = 'bold';
        this.arrowArea.style.padding = '24px';
        this.arrowArea.style.left = '0';
        this.arrowArea.style.right = '0';
        this.arrowArea.style.margin = 'auto';
        this.arrowArea.style.border = 'none';
        this.arrowArea.style.fontSize = '64px';
        this.arrowArea.style.lineHeight = '1';
        this.arrowArea.style.fontFamily = 'monospace';
        this.arrowArea.style.color = 'rgba(239, 239, 255, 0.9)';
        this.arrowArea.style.backgroundColor = 'rgba(0, 0, 32, 0.9)';
        this.arrowArea.style.maxWidth = 'calc(100vw - 64px)';
        this.arrowArea.style.width = 'fit-content';
        this.arrowArea.style.height = 'fit-content';
        this.arrowArea.style.overflowWrap = 'anywhere';

        window.addEventListener('message', (event) => {
            if (event.data.extensionId !== chrome.runtime.id) {
                return;
            }

            switch (event.data.type) {
                case 'add-arrow':
                    this.addArrow(event.data.arrow);
                    break;
                case 'done-gesture':
                    this.done();
                    break;
                case 'reset-gesture':
                    this.reset();
                    break;
            }
        });
    }

    addArrow(arrow) {
        if (this.arrows.length === 0) {
            document.body.appendChild(this.parentElement);
        }
        this.arrows += arrow;
        this.arrowArea.innerText = this.arrows;

        const action = this.options.getGestureAction(this.arrows);
        if (action) {
            this.actionNameArea.innerText = chrome.i18n.getMessage(action);
            this.actionNameArea.style.display = 'inline';
            this.arrowArea.style.marginTop = '10px';
        }
        else {
            this.actionNameArea.style.display = 'none';
            this.arrowArea.style.marginTop = '35px';
        }
    }

    done() {
        const action = this.options.getGestureAction(this.arrows);
        if (action) {
            getGestureActions()[action]();
        }

        this.reset();
    }

    reset() {
        if (this.arrows) {
            this.arrows = '';
            this.arrowArea.innerText = this.arrows;
            document.body.removeChild(this.parentElement);
        }
    }
}

class MouseGestureClient {
    constructor(options) {
        this.options = options;
        this.enabled = true;
        this.previousPoint = undefined;
        this.previousDirection = undefined;
        this.hasGestureDrawn = false;
        this.gestureElement = new GestureElements();
    }

    start() {
        window.addEventListener('wheel', (event) => {
            if (this.enabled && this.options.enabledWheelAction && ((event.buttons & 2) === 2)) {
                event.preventDefault();
                global.shouldPreventContextMenu = true;
            }

            (async () => {
                if (this.enabled && this.options.enabledWheelAction && ((event.buttons & 2) === 2)) {
                    if (this.options.rightButtonAndWheelUp.indexOf('goto') === 0) {
                        // 連続でタブ移動する場合、フラグを解除する。
                        global.shouldPreventContextMenu = false;
                    }

                    if (event.wheelDelta > 0) {
                        const action = getGestureActions()[this.options.rightButtonAndWheelUp];
                        action(true);
                    }
                    else {
                        const action = getGestureActions()[this.options.rightButtonAndWheelDown];
                        action(true);
                    }
                }

                // マウスジェスチャー中の場合はそれをキャンセルする
                this.resetGesture();
            })();
        }, { passive: false });

        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.extensionId !== chrome.runtime.id) {
                return;
            }

            if (request.type === 'prevent-contextmenu') {
                global.shouldPreventContextMenu = true;
            }
        });

        window.addEventListener('contextmenu', (event) => {
            if (global.shouldPreventContextMenu) {
                event.preventDefault();
            }
            global.shouldPreventContextMenu = false;
        });

        window.addEventListener('mousedown', (event) => {
            if (this.enabled && this.options.enabledMouseGesture && (event.buttons & 2) === 2) {
                this.previousPoint = { x: event.clientX, y: event.clientY };
            }
        });

        window.addEventListener('mousemove', (event) => {
            const MINIMUM_DISTANCE = 16;

            if ((event.buttons & 2) === 2 && this.previousPoint) {
                const diffX = event.clientX - this.previousPoint.x;
                const diffY = event.clientY - this.previousPoint.y;
                const distanceSquare = diffX * diffX + diffY * diffY;

                if (this.hasGestureDrawn) {
                    this.drawGestureTrail({ x: event.clientX, y: event.clientY });
                }

                if (distanceSquare >= MINIMUM_DISTANCE * MINIMUM_DISTANCE) {
                    global.shouldPreventContextMenu = true;

                    const currentPoint = { x: event.clientX, y: event.clientY };
                    if (!this.hasGestureDrawn) {
                        this.drawGestureTrail(this.previousPoint);
                        this.drawGestureTrail(currentPoint);
                    }

                    this.previousPoint = currentPoint;

                    const direction = computeDirection(diffX, diffY);
                    if (direction && direction !== this.previousDirection) {
                        getRootWindow().postMessage(
                            {
                                extensionId: chrome.runtime.id,
                                type: 'add-arrow',
                                arrow: direction
                            },
                            '*'
                        );
                        this.previousDirection = direction;
                    }
                }
            }
        });

        window.addEventListener('mouseup', (event) => {
            if (event.button === 2 && this.previousPoint) {
                getRootWindow().postMessage({
                    extensionId: chrome.runtime.id,
                    type: 'done-gesture'
                },
                    '*');
                this.doneGesture();
            }
        });

        window.addEventListener('message', (event) => {
            if (event.data.extensionId === chrome.runtime.id && event.data.type === 'disable-mousegesture') {
                this.enabled = false;
            }
        })
    }

    doneGesture() {
        if (this.previousPoint) {
            this.previousPoint = undefined;
            this.previousDirection = undefined;

            if (this.hasGestureDrawn) {
                this.gestureElement.removeFrom(document.body);
            }
            this.gestureElement.reset();
            this.hasGestureDrawn = false;
        }
    }

    resetGesture() {
        if (this.previousPoint) {
            this.doneGesture();
            global.shouldPreventContextMenu = false;
            getRootWindow().postMessage({ extensionId: chrome.runtime.id, type: 'reset-gesture' }, `*`);
        }
    }

    drawGestureTrail(point) {
        if (this.hasGestureDrawn === false) {
            this.hasGestureDrawn = true;
            this.gestureElement.insertTo(document.body);
            this.gestureElement.drawLine(point);
        }
        else {
            this.gestureElement.drawLine(point);
        }
    }
}

(async () => {
    let options = new ExtensionOption();
    await options.loadFromStrageLocal();
    new MouseGestureClient(options).start();
    if (!isInIFrame()) {
        new ShowArrowsElements(options);
    }
})();
