const global = new InterIframeVariables();  // IFRAME間で共有する変数

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
            getGestureActions()[action](actionOption);
        }
    }
}

class MouseGestureClient {
    constructor(options) {
        this.options = options;
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
        this.isRightButtonPressed = false;
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
            global.shouldPreventContextMenu = false;    // タブから離れるときにコンテキストメニューの抑制を解除
            this.resetGesture();
            this.isRightButtonPressed = false;
        });

        window.addEventListener('wheel', (event) => {
            if (!global.enabledExtension) {
                return;
            }

            const isWheelAction = () => this.options.enabledWheelAction && (event.buttons === 2) && !this.onMouseGesture;

            if (isWheelAction()) {
                if (checkHasExtensionBeenUpdated()) {
                    this.resetGesture();
                    return;
                }

                event.preventDefault();
                global.shouldPreventContextMenu = true;

                this.resetGesture();    // マウスジェスチャー中の場合はそれをキャンセルする
            }

            (async () => {
                if (isWheelAction()) {
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
                        action(option);
                    }
                }
            })();
        }, { capture: true, passive: false });

        window.addEventListener('mousedown', (event) => {
            if (!global.enabledExtension) {
                return;
            }

            if (event.button === 2) {
                this.isRightButtonPressed = true;
            }

            // ロッカージェスチャー
            if (event.buttons === 3 && !this.onMouseGesture) {
                if (checkHasExtensionBeenUpdated()) {
                    this.resetGesture();
                    return;
                }

                let command = '';
                if (event.button === 0 && this.options.rockerGestureRightLeft) {
                    command = this.options.rockerGestureRightLeft;
                }
                else if (event.button === 2 && this.options.rockerGestureLeftRight) {
                    command = this.options.rockerGestureLeftRight;
                }

                if (command) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    global.shouldPreventContextMenu = true;

                    processAction(this.options, command, this.getActionOptions());

                    return;
                }
            }

            // マウスジェスチャー
            if (this.options.enabledMouseGesture) {
                if ((event.button === 0) && this.previousPoint) {
                    if (checkHasExtensionBeenUpdated()) {
                        this.resetGesture();
                        return;
                    }

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
            if (!global.enabledExtension) {
                return;
            }

            const strokeLength = this.options.mouseGestureStrokeLength;

            if ((event.buttons & 2) === 2 && this.previousPoint && ((event.buttons & 1) === 0)) {
                const diffX = event.clientX - this.previousPoint.x;
                const diffY = event.clientY - this.previousPoint.y;
                const distanceSquare = diffX * diffX + diffY * diffY;

                if (checkHasExtensionBeenUpdated()) {
                    this.resetGesture();
                    return;
                }

                if (this.hasGestureDrawn) {
                    this.drawGestureTrail({ x: event.clientX, y: event.clientY });
                }

                if (distanceSquare >= strokeLength * strokeLength) {
                    global.shouldPreventContextMenu = true;

                    this.rightClickCount = 0;   // 素早くマウスジェスチャーを繰り返したときに右ダブルクリックと判定しないようにリセットする

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
            if (!global.enabledExtension) {
                return;
            }

            if (event.button === 2) {
                this.isRightButtonPressed = false;
            }

            // マウスジェスチャー
            if (event.button === 2) {
                if (this.previousPoint) {
                    if (this.onMouseGesture) {
                        event.preventDefault();
                        event.stopImmediatePropagation();
                    }

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
                this.isRightButtonPressed = true;   // 右ボタンを押したまま移動してきたはずなのでtrueにする
            }
        });

        window.addEventListener('contextmenu', (event) => {
            if (global.shouldPreventContextMenu) {
                event.preventDefault();
            }
            global.shouldPreventContextMenu = false;
        });

        window.addEventListener('click', (event) => {
            if (((event.button === 0) && this.onMouseGesture) ||     // マウスジェスチャー中
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
                global.enabledExtension = false;
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
        if (this.previousPoint) {
            this.doneGesture();
            global.shouldPreventContextMenu = false;
            getRootWindow().postMessage({ extensionId: chrome.runtime.id, type: 'reset-gesture' }, `*`);
        }

        this.arrows = '';
        this.url = undefined;
        this.src = undefined;
        this.target = undefined;
        this.rightClickCount = 0;
        this.onMouseGesture = false;
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
            shouldPreventContextMenu: this.isRightButtonPressed,
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
                }, 750);
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
    let options = new ExtensionOption();
    await options.loadFromStrageLocal();
    new MouseGestureClient(options).start();
    if (isRootWindow()) {
        new ShowArrowsElements(options);
        (new BookMarkEditDialogElements()).start();

        // 子windowから送られてきたジェスチャーの実行要求を処理
        window.addEventListener('message', (event) => {
            if (event.data.extensionId !== chrome.runtime.id) {
                return;
            }

            switch (event.data.type) {
                case 'execute-action':
                    getGestureActions()[event.data.action](event.data.option);
                    break;
            }
        });
    }
})();
