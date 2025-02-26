function createBackgroundElement(isCentering) {
    const element = document.createElement('div');
    element.style.all = 'initial';
    element.style.width = '100vw';
    element.style.height = '100vh';
    element.style.position = 'fixed';
    element.style.left = '0px';
    element.style.top = '0px';
    element.style.margin = '0px';
    element.style.padding = '0px';
    element.style.border = 'none';
    if (isCentering) {
        element.style.display = 'grid';
        element.style.placeContent = 'center';
        element.style.gap = '1ch';
    }

    return element;
}

function createCenteringElement() {
    const element = document.createElement('div');
    element.style.all = 'revert';
    element.style.maxWidth = '100vw';
    element.style.width = 'fit-content';
    element.style.height = 'fit-content';

    return element;
}

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
                        sendMessage({ action: 'openlinkinnwetabandactivate', url: url });
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
            getGestureActions()[action](actionOption);
        }
    }
}

// IFRAME間で共有する変数
const global = new class {
    constructor() {
        this.variables = {
            shouldPreventContextMenu: false,
            selectedText: undefined,
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
                    if (isRootWindow()) {
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

    set selectedText(text) {
        this.variables.selectedText = text;
        this.sync();
    }

    get selectedText() {
        return this.variables.selectedText;
    }
}();

class GestureElements {
    constructor(options) {
        this.options = options;

        this.previousPoint = undefined;

        this.backgroundElement = createBackgroundElement();
        this.backgroundElement.style.zIndex = 16777271;
        this.backgroundElement.style.backgroundColor = 'transparent';

        this.canvasElement = document.createElement('canvas');
        this.canvasElement.style.all = 'revert';
        this.canvasElement.style.margin = '0px';
        this.canvasElement.style.padding = '0px';
        this.canvasElement.style.backgroundColor = 'transparent';

        this.backgroundElement.appendChild(this.canvasElement);
    }

    insertTo(targetElement) {
        targetElement.insertBefore(this.backgroundElement, null);
        this.canvasElement.width = document.documentElement.clientWidth;
        this.canvasElement.height = document.documentElement.clientHeight;
    }

    removeFrom(targetElement) {
        targetElement.removeChild(this.backgroundElement);
    }

    drawLine(point) {
        if (this.previousPoint) {
            const ctx = this.canvasElement.getContext('2d');
            ctx.lineWidth = 4;
            if (this.options.hideGestureLine) {
                ctx.strokeStyle = 'rgba(0, 0, 0, 0)';
            }
            else {
                ctx.strokeStyle = this.options.gestureLineColor;
            }
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

        this.backgroundElement = createBackgroundElement(true);
        this.backgroundElement.style.zIndex = 16777270;
        this.backgroundElement.style.backgroundColor = 'transparent';
        this.backgroundElement.style.pointerEvents = 'none'; // 特定のIFRAME（主にブラウザゲーム）でマウスジェスチャ可能にするために必要

        this.centeringElement = createCenteringElement();
        this.backgroundElement.appendChild(this.centeringElement);
        this.centeringElement.style.textAlign = 'center';
        this.centeringElement.style.pointerEvents = 'none';

        this.actionNameArea = document.createElement('div');
        this.centeringElement.appendChild(this.actionNameArea);
        this.actionNameArea.style.all = 'revert';
        this.actionNameArea.style.width = 'fit-content';
        this.actionNameArea.style.height = 'fit-content';
        this.actionNameArea.style.margin = '0px';
        this.actionNameArea.style.border = 'none';
        this.actionNameArea.style.padding = '8px';
        this.actionNameArea.style.fontSize = '24px';
        this.actionNameArea.style.lineHeight = '1';
        this.actionNameArea.style.fontFamily = 'BIZ UDPGothic';
        if (this.options.hideGestureText) {
            this.actionNameArea.style.color = 'rgba(0, 0, 0, 0)';
        }
        else {
            this.actionNameArea.style.color = this.options.gestureFontColor;
        }
        this.actionNameArea.style.backgroundColor = this.options.gestureBackgroundColor;
        this.actionNameArea.style.display = 'none';
        this.actionNameArea.style.pointerEvents = 'none';

        this.arrowArea = document.createElement('div');
        this.centeringElement.appendChild(this.arrowArea);
        this.arrowArea.style.all = 'revert';
        this.arrowArea.style.fontWeight = 'bold';
        this.arrowArea.style.padding = '24px';
        this.arrowArea.style.left = '0';
        this.arrowArea.style.right = '0';
        this.arrowArea.style.margin = 'auto';
        this.arrowArea.style.border = 'none';
        this.arrowArea.style.fontSize = '64px';
        this.arrowArea.style.lineHeight = '1';
        this.arrowArea.style.fontFamily = 'monospace';
        if (this.options.hideGestureText) {
            this.arrowArea.style.color = 'rgba(0, 0, 0, 0)';
        }
        else {
            this.arrowArea.style.color = this.options.gestureFontColor;
        }
        this.arrowArea.style.backgroundColor = this.options.gestureBackgroundColor;
        this.arrowArea.style.maxWidth = 'calc(100vw - 64px)';
        this.arrowArea.style.width = 'fit-content';
        this.arrowArea.style.height = 'fit-content';
        this.arrowArea.style.overflowWrap = 'anywhere';
        this.arrowArea.style.pointerEvents = 'none';

        window.addEventListener('message', (event) => {
            if (event.data.extensionId !== chrome.runtime.id) {
                return;
            }

            switch (event.data.type) {
                case 'show-arrows':
                    this.showArrows(event.data.arrows);
                    break;
                case 'reset-gesture':
                    this.resetMouseGesture();
                    break;
            }
        });
    }

    showArrows(arrows) {
        if (this.arrows.length === 0) {
            if (this.options.hideGestureText) {
                this.actionNameArea.style.color = 'rgba(0, 0, 0, 0)';
            }
            else {
                this.actionNameArea.style.color = this.options.gestureFontColor;
            }
            if (this.options.hideGestureBackground) {
                this.actionNameArea.style.backgroundColor = 'rgba(0, 0, 0, 0)';
            }
            else {
                this.actionNameArea.style.backgroundColor = this.options.gestureBackgroundColor;
            }
            this.arrowArea.style.color = this.actionNameArea.style.color;
            this.arrowArea.style.backgroundColor = this.actionNameArea.style.backgroundColor;
            document.body.appendChild(this.backgroundElement);
        }
        this.arrows = arrows;
        this.arrowArea.innerText = this.arrows;

        const action = this.options.getGestureAction(this.arrows);
        if (action) {
            if (action.startsWith('customurl:')) {
                this.actionNameArea.innerText = `${chrome.i18n.getMessage('opencustomurl')}:${action.substring(10)}`;
            }
            else if (action) {
                this.actionNameArea.innerText = chrome.i18n.getMessage(action);
            }
            this.actionNameArea.style.display = 'inline';
            this.arrowArea.style.marginTop = '10px';
        }
        else {
            this.actionNameArea.style.display = 'none';
            this.arrowArea.style.marginTop = '35px';
        }
    }

    // doneMouseGesture(data) {
    //     processAction(this.options, this.options.getGestureAction(this.arrows), data);
    //     this.resetMouseGesture();
    // }

    resetMouseGesture() {
        if (this.arrows) {
            this.arrows = '';
            this.arrowArea.innerText = this.arrows;
            document.body.removeChild(this.backgroundElement);
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
        this.gestureElement = new GestureElements(options);
        this.arrows = '';
        this.url = undefined;
        this.src = undefined;
        this.target = undefined;
        this.rightClickCount = 0;
        this.onMouseGesture = false;
        this.rockerGestureMode = undefined;
        this.hasMouseLightButtonDowned = false;
    }

    start() {
        this.disableExtensionByUrlCondition();

        document.addEventListener("selectionchange", () => {
            const text = window.getSelection().toString();
            if (text) {
                global.selectedText = text;
            }
        });

        window.addEventListener('blur', () => {
            global.shouldPreventContextMenu = false;    // ロッカージェスチャーでタブ移動したとき用
            this.hasMouseLightButtonDowned = false;     // ロッカージェスチャーでマウス右ボタンを押したまま移動してきた場合にコンテキストメニューを抑制
        });

        window.addEventListener('wheel', (event) => {
            if (!this.enabled) {
                return;
            }

            const isWheelAction = () => this.options.enabledWheelAction && ((event.buttons & 2) === 2) && !this.onMouseGesture && !this.rockerGestureMode;

            if (isWheelAction()) {
                event.preventDefault();
                global.shouldPreventContextMenu = true;
            }

            (async () => {
                if (isWheelAction()) {
                    if (this.options.rightButtonAndWheelUp && this.options.rightButtonAndWheelUp.startsWith && this.options.rightButtonAndWheelUp.startsWith('goto')) {
                        // 連続でタブ移動する場合、フラグを解除する。
                        global.shouldPreventContextMenu = false;
                    }

                    this.setActionOptionsFromElement(event.target);
                    let action;
                    if (event.wheelDelta > 0) {
                        action = getGestureActions()[this.options.rightButtonAndWheelUp];
                    }
                    else {
                        action = getGestureActions()[this.options.rightButtonAndWheelDown];
                    }
                    if (typeof action === 'function') {
                        const option = this.getActionOptions();
                        option['shouldPreventContextMenu'] = true;
                        action(option);
                    }

                    // マウスジェスチャー中の場合はそれをキャンセルする
                    this.resetGesture();
                }
            })();
        }, { capture: true, passive: false });

        window.addEventListener('mousedown', (event) => {
            if (!this.enabled) {
                return;
            }

            // ロッカージェスチャーでマウス右ボタンを押したまま移動してきた場合にコンテキストメニューを抑制
            if (!this.options.rightDoubleClickToContextMenu) {
                this.hasMouseLightButtonDowned = true;  // このフラグがfalseの場合にmouseup時にコンテキストメニューを抑制
            }

            // ロッカージェスチャー開始
            if (event.buttons === 3 && !this.onMouseGesture) {
                global.shouldPreventContextMenu = true;
                if (event.button === 0 && this.options.rockerGestureRightLeft) {
                    this.rockerGestureMode = 'right-left';
                    this.setActionOptionsFromElement(event.target);
                }
                else if (event.button === 2 && this.options.rockerGestureLeftRight) {
                    this.rockerGestureMode = 'left-right';
                    this.setActionOptionsFromElement(event.target);
                }

                this.previousPoint = undefined; // マウスジェスチャーをキャンセル
            }

            // マウスジェスチャー
            if (this.options.enabledMouseGesture && !this.rockerGestureMode) {
                if (((event.buttons & 1) !== 0) && this.previousPoint) {
                    event.preventDefault();
                    event.stopImmediatePropagation();

                    this.onMouseGesture = true;
                    this.arrows += 'Click ';
                    getRootWindow().postMessage(
                        {
                            extensionId: chrome.runtime.id,
                            type: 'show-arrows',
                            arrows: this.arrows,
                        },
                        '*'
                    );
                    this.previousDirection = undefined;
                    this.previousPoint = { x: event.clientX, y: event.clientY };
                    global.shouldPreventContextMenu = true;
                }

                if (event.buttons === 2) {  // right button only
                    if (this.handleContextMenu().shouldStop) {
                        return;
                    }

                    this.previousPoint = { x: event.clientX, y: event.clientY };
                    this.setActionOptionsFromElement(event.target);
                    this.target = event.target;
                }
            }
        }, {
            capture: true  // WEBサイト上の他のスクリプトのstopImmediatePropagation()への対処
        });

        window.addEventListener('mousemove', (event) => {
            if (!this.enabled) {
                return;
            }

            this.rightClickCount = 0;   // 素早くマウスジェスチャーを繰り返したときに右ダブルクリックと判定しないようにリセットする

            const MINIMUM_DISTANCE = 16;

            if ((event.buttons & 2) === 2 && this.previousPoint && !this.rockerGestureMode) {
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
                        this.onMouseGesture = true;
                        this.arrows += direction;
                        getRootWindow().postMessage(
                            {
                                extensionId: chrome.runtime.id,
                                type: 'show-arrows',
                                arrows: this.arrows,
                            },
                            '*'
                        );
                        this.previousDirection = direction;
                    }
                }
            }
        }, {
            capture: true
        });

        window.addEventListener('mouseup', (event) => {
            if (!this.enabled) {
                return;
            }

            // ロッカージェスチャーでマウス右ボタンを押したまま移動してきた場合にコンテキストメニューを抑制
            if (!this.hasMouseLightButtonDowned) {
                this.hasMouseLightButtonDowned = false;
                global.shouldPreventContextMenu = true;
            }

            // ロッカージェスチャー
            if (this.rockerGestureMode) {
                let command = '';
                if (this.rockerGestureMode === 'right-left' && event.button === 0 && this.options.rockerGestureRightLeft) {
                    command = this.options.rockerGestureRightLeft;
                }
                else if (this.rockerGestureMode === 'left-right' && event.button === 2 && this.options.rockerGestureLeftRight) {
                    command = this.options.rockerGestureLeftRight;
                }

                if (command) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    if (command.startsWith('goto')) {
                        this.rockerGestureMode = undefined;
                        this.resetGesture();
                    }
                    else if (command === 'back' || command === 'forward') {
                        this.rockerGestureMode = undefined;
                    }

                    processAction(this.options, command, this.getActionOptions());
                }

                this.rockerGestureMode = undefined;
            }

            // reset RockerGesture state
            if (event.buttons === 0) {
                this.rockerGestureMode = undefined;
                if (event.button === 0) {
                    global.shouldPreventContextMenu = false;
                }
            }

            // マウスジェスチャー
            if (event.button === 2) {
                event.preventDefault();
                event.stopImmediatePropagation();

                if (this.previousPoint) {
                    const command = this.options.getGestureAction(this.arrows);
                    processAction(this.options, command, this.getActionOptions());

                    getRootWindow().postMessage({
                        extensionId: chrome.runtime.id,
                        type: 'reset-gesture',
                    }, '*');
                    this.doneGesture();
                }

                this.url = undefined;
                this.src = undefined;
                this.onMouseGesture = false;
            }
        }, {
            capture: true  // WEBサイト上の他のスクリプトのstopImmediatePropagation()への対処
        });

        chrome.runtime.onMessage.addListener((request) => {
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

        window.addEventListener('click', (event) => {
            if (((event.button === 0) && this.previousPoint) ||     // マウスジェスチャー中
                ((event.button === 0) && (event.buttons === 2))      // ロッカージェスチャー中
            ) {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        }, {
            capture: true
        });

        window.addEventListener('message', (event) => {
            if (event.data.extensionId === chrome.runtime.id && event.data.type === 'disable-mousegesture') {
                this.enabled = false;
            }
        });
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
        this.arrows = '';
    }

    resetGesture() {
        this.onMouseGesture = false;
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

    setActionOptionsFromElement(element) {
        this.target = element;

        // get url and src attribute
        this.url = undefined;
        this.src = undefined;
        let elem = element;
        while (elem) {
            if (elem.href) {
                this.url = elem.href;
                break;
            }
            else if (elem.src) {
                this.src = elem.src;
                break;
            }

            elem = elem.parentNode;
        }
    }

    getActionOptions() {
        return {
            target: this.target,
            url: this.url,
            src: this.src,
        }
    }

    /**
     * Processing for macOS/Linux to display context menu when right button is pressed.
     * Right double-click to display context menu.
     * @returns Whether the mouse gesture process should be interrupted
     */
    handleContextMenu() {
        if (this.options.rightDoubleClickToContextMenu) {
            this.rightClickCount++;
            if (this.rightClickCount === 1) {
                global.shouldPreventContextMenu = true;
                this.rightClickTimeout = setTimeout(() => {
                    this.rightClickCount = 0;
                }, 500);
            }
            else if (this.rightClickCount === 2) {
                clearTimeout(this.rightClickTimeout);
                this.rightClickCount = 0;
                global.shouldPreventContextMenu = false;
                return { shouldStop: true };
            }
        }
        return { shouldStop: false };
    }

    disableExtensionByUrlCondition() {
        if ((Object.prototype.toString.call(this.options.disableExtensionSettings) !== '[object Array]') || (this.options.disableExtensionSettings.length === 0)) {
            return;
        }

        for (const setting of this.options.disableExtensionSettings) {
            switch (setting.method) {
                case 'prefixMatch':
                    if (document.location.href.indexOf(setting.value) === 0) {
                        this.enabled = false;
                        return;
                    }
                    break;
                case 'include':
                    if (document.location.href.indexOf(setting.value) !== -1) {
                        this.enabled = false;
                        return;
                    }
                    break;
                case 'regexp':
                    const match = document.location.href.match(`/${setting.value}/`);
                    if (match && match.length) {
                        this.enabled = false;
                        return;
                    }
                    break;
                default:
                    break;
            }
        }
    }
}

class BookMarkEditDialogElements {
    constructor() {
        this.targetElement = undefined;
        this.backgroundElement = undefined;
        this.existingBookmark = undefined;
        this.nameInputElement = undefined;
        this.urlInputElement = undefined;
        this.folderSelectElement = undefined;

        this.on = {
            ok: this.onOk.bind(this),
            cancel: this.onCancel.bind(this),
            deleteBookmark: this.onDeleteBookmark.bind(this),
        };
    }

    start() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request && request.extensionId === chrome.runtime.id && request.type === 'upsertbookmarkresponse') {
                (async () => {
                    if (!this.targetElement) {
                        const data = await chrome.storage.local.get(['defaultBookmarkFolder']);
                        this.addDialog(request.bookmarks, request.existsBookmark, data ? data.defaultBookmarkFolder : undefined);
                    }
                })();
            }
        });
    }

    addDialog(bookmarks, isEditMode, defaultBookmarkFolder) {
        this.targetElement = document.body;
        this.addEventListeners();

        this.existingBookmark = this.findBookmark(bookmarks, document.location.href);

        this.backgroundElement = createBackgroundElement(true);
        this.backgroundElement.style.zIndex = 16777271;
        this.backgroundElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.backgroundElement.addEventListener('click', (event) => {
            if (event.target === this.backgroundElement) {
                this.onCancel(event);
            }
        });

        const centeringElement = createCenteringElement();
        this.backgroundElement.appendChild(centeringElement);

        const dialogElement = document.createElement('div');
        dialogElement.style.all = 'revert';
        dialogElement.style.position = 'relative';
        dialogElement.style.backgroundColor = 'white';
        dialogElement.style.padding = '2em';
        centeringElement.appendChild(dialogElement);

        const cancelButton = document.createElement('a');
        cancelButton.href = '#';
        cancelButton.innerText = chrome.i18n.getMessage('strClose');
        cancelButton.style.all = 'revert';
        cancelButton.style.fontWeight = 'bold';
        cancelButton.style.textDecoration = 'none';
        cancelButton.style.color = 'black';
        cancelButton.style.display = 'block';
        cancelButton.style.position = 'absolute';
        cancelButton.style.right = '1em';
        cancelButton.style.top = '1em';
        cancelButton.addEventListener('click', this.on.cancel);
        dialogElement.appendChild(cancelButton);

        const titleBarElement = document.createElement('div');
        titleBarElement.style.all = 'revert';
        dialogElement.appendChild(titleBarElement);

        const titleElement = document.createElement('span');
        titleElement.innerText = isEditMode ? chrome.i18n.getMessage('strBookmarkDialogTitleEdit') : chrome.i18n.getMessage('strBookmarkDialogTitleAdd');
        titleElement.style.all = 'revert';
        titleElement.style.marginBottom = '1em';
        titleBarElement.appendChild(titleElement);

        const tableElement = document.createElement('div');
        tableElement.style.all = 'revert';
        tableElement.style.display = 'table';
        tableElement.style.marginBottom = '1em';
        dialogElement.appendChild(tableElement);

        const rowNameElement = document.createElement('div');
        rowNameElement.style.all = 'revert';
        rowNameElement.style.display = 'table-row';
        tableElement.appendChild(rowNameElement);

        const nameRabelElement = document.createElement('div');
        nameRabelElement.style.all = 'revert';
        nameRabelElement.style.display = 'table-cell';
        nameRabelElement.style.padding = '1em';
        nameRabelElement.innerText = chrome.i18n.getMessage('strBookmarkDialogName');
        rowNameElement.appendChild(nameRabelElement);

        const nameInputColumnElement = document.createElement('div');
        nameInputColumnElement.style.all = 'revert';
        nameInputColumnElement.style.display = 'table-cell';
        rowNameElement.appendChild(nameInputColumnElement);

        this.nameInputElement = document.createElement('input');
        this.nameInputElement.style.all = 'revert';
        this.nameInputElement.type = 'text';
        this.nameInputElement.style.width = '40vw';
        if (this.existingBookmark) {
            this.nameInputElement.value = this.existingBookmark.title || '';
        }
        else {
            this.nameInputElement.value = document.title;
        }
        nameInputColumnElement.appendChild(this.nameInputElement);

        const rowUrlElement = document.createElement('div');
        rowUrlElement.style.all = 'revert';
        rowUrlElement.style.display = 'table-row';
        tableElement.appendChild(rowUrlElement);

        const urlRabelElement = document.createElement('div');
        urlRabelElement.style.all = 'revert';
        urlRabelElement.style.display = 'table-cell';
        urlRabelElement.style.padding = '1em';
        urlRabelElement.innerText = chrome.i18n.getMessage('strBookmarkDialogUrl');
        rowUrlElement.appendChild(urlRabelElement);

        const urlInputColumnElement = document.createElement('div');
        urlInputColumnElement.style.all = 'revert';
        urlInputColumnElement.style.display = 'table-cell';
        rowUrlElement.appendChild(urlInputColumnElement);

        this.urlInputElement = document.createElement('input');
        this.urlInputElement.style.all = 'revert';
        this.urlInputElement.type = 'text';
        this.urlInputElement.style.width = '40vw';
        this.urlInputElement.value = this.existingBookmark ? this.existingBookmark.url : document.location.href;
        urlInputColumnElement.appendChild(this.urlInputElement);

        const rowFolderElement = document.createElement('div');
        rowFolderElement.style.all = 'revert';
        rowFolderElement.style.display = 'table-row';
        tableElement.appendChild(rowFolderElement);

        const folderRabelElement = document.createElement('div');
        folderRabelElement.style.all = 'revert';
        folderRabelElement.style.display = 'table-cell';
        folderRabelElement.style.padding = '1em';
        folderRabelElement.innerText = chrome.i18n.getMessage('strBookmarkDialogFolder');
        rowFolderElement.appendChild(folderRabelElement);

        const folderSelectColumnElement = document.createElement('div');
        folderSelectColumnElement.style.all = 'revert';
        folderSelectColumnElement.style.display = 'table-cell';
        rowFolderElement.appendChild(folderSelectColumnElement);

        this.folderSelectElement = document.createElement('select');
        this.folderSelectElement.style.all = 'revert';
        this.folderSelectElement.style.width = '40vw';
        folderSelectColumnElement.appendChild(this.folderSelectElement);

        const parentIdOfexistingBookmark = this.existingBookmark ? this.existingBookmark.parentId : defaultBookmarkFolder;
        let bookmarkNodes = bookmarks;
        while (bookmarkNodes.length) {
            const nextBookmarkNodes = [];
            for (const node of bookmarkNodes) {
                if (node.children) {
                    for (const child of node.children) {
                        nextBookmarkNodes.push(child);
                    }

                    if (node.title) {
                        const optionElement = document.createElement('option');
                        optionElement.style.all = 'revert';
                        optionElement.innerText = node.title;
                        optionElement.value = node.id;
                        if (parentIdOfexistingBookmark === node.id) {
                            optionElement.selected = true;
                        }
                        this.folderSelectElement.appendChild(optionElement);
                    }
                }
            }

            bookmarkNodes = nextBookmarkNodes;
        }

        const buttonsAreaElement = document.createElement('div');
        buttonsAreaElement.style.all = 'revert';
        buttonsAreaElement.style.display = 'grid';
        buttonsAreaElement.style.gridTemplateColumns = '1fr 1fr';
        buttonsAreaElement.style.placeContent = 'center';
        buttonsAreaElement.style.gap = '1ch';
        dialogElement.appendChild(buttonsAreaElement);

        const deleteButtonColumn = document.createElement('div');
        deleteButtonColumn.style.all = 'revert';
        deleteButtonColumn.style.textAlign = 'center';
        buttonsAreaElement.appendChild(deleteButtonColumn);

        const deleteButton = document.createElement('a');
        deleteButton.innerText = chrome.i18n.getMessage('strDelete');
        deleteButton.href = '#';
        deleteButton.style.all = 'revert';
        deleteButton.addEventListener('click', this.on.deleteBookmark);
        deleteButtonColumn.appendChild(deleteButton);

        const okButtonColumn = document.createElement('div');
        okButtonColumn.style.all = 'revert';
        okButtonColumn.style.textAlign = 'center';
        buttonsAreaElement.appendChild(okButtonColumn);

        const okButton = document.createElement('button');
        okButton.innerText = chrome.i18n.getMessage('strOk');
        okButton.style.all = 'revert';
        okButton.style.width = '10em';
        okButton.addEventListener('click', this.on.ok);
        okButtonColumn.appendChild(okButton);

        this.targetElement.appendChild(this.backgroundElement);
        this.nameInputElement.focus();
        this.nameInputElement.select();
    }

    findBookmark(bookmarks, url) {
        let bookmarkNodes = bookmarks;
        while (bookmarkNodes.length) {
            const nextBookmarkNodes = [];
            for (const node of bookmarkNodes) {
                if (node.children) {
                    for (const child of node.children) {
                        nextBookmarkNodes.push(child);
                    }
                }
                else if (node.url && node.url === url) {
                    return node;
                }
            }

            bookmarkNodes = nextBookmarkNodes;
        }
    }

    reset() {
        this.targetElement.removeChild(this.backgroundElement);
        this.targetElement = undefined;
        this.backgroundElement = undefined;
        this.existingBookmark = undefined;
        this.nameInputElement = undefined;
        this.urlInputElement = undefined;
        this.folderSelectElement = undefined;

        this.removeEventListeners();
    }

    onOk(event) {
        if (event.type === 'click' || event.key === 'Enter') {
            const newBookmark = {
                id: this.existingBookmark ? this.existingBookmark.id : undefined,
                title: this.nameInputElement.value,
                url: this.urlInputElement.value,
                parentId: this.folderSelectElement.value
            };
            sendMessage({ action: 'editbookmark', bookmark: newBookmark });
            this.reset();
            this.setDefaultBookmarkFolder(newBookmark.parentId);
        }
    }

    onCancel(event) {
        if (event.type === 'click' || event.key === 'Escape') {
            event.preventDefault();
            this.reset();
        }
    }

    onDeleteBookmark(event) {
        event.preventDefault();
        sendMessage({ action: 'deletebookmark', bookmark: { url: document.location.href } });
        this.reset();
    }

    addEventListeners() {
        window.addEventListener('keydown', this.on.ok);
        window.addEventListener('keydown', this.on.cancel);
    }

    removeEventListeners() {
        window.removeEventListener('keydown', this.on.ok);
        window.removeEventListener('keydown', this.on.cancel);
    }

    setDefaultBookmarkFolder(folderId) {
        chrome.storage.local.set({ defaultBookmarkFolder: folderId }).then();
    }
}

(async () => {
    let options = new ExtensionOption();
    await options.loadFromStrageLocal();
    new MouseGestureClient(options).start();
    if (isRootWindow()) {
        new ShowArrowsElements(options);
        (new BookMarkEditDialogElements()).start();
    }
})();
