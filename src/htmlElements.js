/**
 * @file Mouse Gesture Elements
 * @description This file contains the elements used for content.js.
 */

/**
 * @import { ExtensionOptions } from './ExtensionOptions.js';
 * @import { Point, sendChromeMessage } from './utilities.js';
 */

/**
 * @typedef {Object} BookmarkTreeNode
 * @property {string} id - The ID of the bookmark.
 * @property {string} title - The title of the bookmark.
 * @property {string} url - The URL of the bookmark.
 * @property {string} parentId - The ID of the parent folder.
 * @property {BookmarkTreeNode[]} children - The children of the bookmark.
 * @property {number} dateAdded - The date the bookmark was added.
 * @property {number} dateGroupModified - The date the bookmark was last modified.
 * @property {number} dateLastUsed - The date the bookmark was last used.
 * @property {FolderType} folderType - The type of the folder.
 * @property {number} index - The index of the bookmark.
 * @property {boolean} syncing - Whether this node is synced with the user's remote account storage by the browser.
 * @property {"managed"} unmodifiable - Indicates the reason why this node is unmodifiable. 
 */

/**
 * @summary Create a background element.
 * @param {boolean} isCentering - Whether to center the element or not.
 * @returns The created element.
 */
function createBackgroundElement(isCentering) {
    const element = document.createElement('div');
    let style = 'all: initial; width: 100vw; height: 100vh; position: fixed; left: 0px; top: 0px; margin: 0px; padding: 0px; border: none;';

    if (isCentering) {
        style += ' display: grid; place-content: center; gap: 1ch;';
    }

    element.setAttribute('style', style);

    return element;
}

function createPositionElement(position) {
    // Get the size of the scrollbar
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const scrollbarHeight = window.innerHeight - document.documentElement.clientHeight;

    // Create the element
    const element = document.createElement('div');
    let style = 'all: initial; width: fit-content; height: fit-content;';

    switch (position) {
        case 'top-left':
            style += 'position: absolute; top: 0; left: 0;';
            break;
        case 'top':
            style += 'position: absolute; top: 0; left: 50%; transform: translateX(-50%);';
            break;
        case 'top-right':
            style += 'position: absolute; top: 0; right: 0;';
            break;
        case 'left':
            style += 'position: absolute; top: 50%; left: 0; transform: translateY(-50%);';
            break;
        case 'center': /* fall through */
        default:
            style += 'maxWidth: 100vw;';
            break;
        case 'right':
            style += `position: absolute; top: 50%; right: ${scrollbarWidth}px; transform: translateY(-50%);`;
            break;
        case 'bottom-left':
            style += `position: absolute; bottom: ${scrollbarHeight}px; left: 0;`;
            break;
        case 'bottom':
            style += `position: absolute; bottom: ${scrollbarHeight}px; left: 50%; transform: translateX(-50%);`;
            break;
        case 'bottom-right':
            style += `position: absolute; bottom: ${scrollbarHeight}px; right: ${scrollbarWidth}px;`;
            break;
    }

    element.setAttribute('style', style);

    return element;
}

function createActionNameAreaElement(options) {
    const element = document.createElement('div');
    const style = `all: revert; width: fit-content; height: ${options.gestureTextFontSize}px; margin: 0px; border: none; line-height: 1; font-family: BIZ UDPGothic; background-color: ${options.gestureBackgroundColor}; display: none; pointer-events: none; white-space: nowrap; color: ${options.gestureFontColor}; background-color: ${options.gestureBackgroundColor}; font-size: ${options.gestureTextFontSize}px; padding: ${Math.floor(options.gestureTextFontSize) / 3}px;`;

    element.setAttribute('style', style);

    return element;
}

function createArrowsAreaElement(options) {
    const element = document.createElement('div');
    let style = `all: revert; font-weight: bold; border: none; line-height: 1; font-family: monospace; background-color: ${options.gestureBackgroundColor}; max-width: 100vw; width: fit-content; height: fit-content; overflow-wrap: anywhere; pointer-events: none; color: ${options.gestureArrowColor}; background-color: ${options.gestureBackgroundColor}; font-size: ${options.gestureArrowFontSize}px; padding: ${Math.floor(options.gestureArrowFontSize / 8)}px;`;

    switch (options.showArrowsPosition) {
        case 'top-left': /* fall through */
        case 'left': /* fall through */
        case 'bottom-left':
            style += 'margin-left: auto; text-align: left;';
            break;
        case 'top': /* fall through */
        case 'center': /* fall through */
        case 'bottom':
        default:
            style += 'margin-right: auto; margin-left: auto; text-align: center;';
            break;
        case 'top-right': /* fall through */
        case 'right': /* fall through */
        case 'bottom-right':
            style += 'margin-right: auto; text-align: right;';
            break;
    }

    element.setAttribute('style', style);

    return element;
}

/**
 * @summary Create a centering element.
 * @returns The created element.
 */
function createCenteringElement() {
    const element = document.createElement('div');
    let style = 'all: revert; maxWidth: 100vw; width: fit-content; height: fit-content;';

    element.setAttribute('style', style);

    return element;
}

/**
 * @summary Class for mouse gesture elements.
 */
class GestureElements {
    /**
     * @type {ExtensionOptions | undefined}
     */
    #options = undefined;

    /**
     * @type {Point | undefined}
     */
    #previousPoint = undefined;

    /**
     * @type {HTMLElement | undefined}
     */
    #backgroundElement = undefined;

    /**
     * @type {HTMLCanvasElement | undefined}
     */
    #canvasElement = undefined;

    /**
     * @constructor
     * @param {ExtensionOptions} options 
     */
    constructor(options) {
        this.#options = options;

        this.#backgroundElement = createBackgroundElement();
        if (this.#backgroundElement.style) {
            this.#backgroundElement.style.zIndex = 16777271;
            this.#backgroundElement.style.backgroundColor = 'transparent';
        }

        this.#canvasElement = document.createElement('canvas');
        this.#canvasElement.setAttribute('style', 'all: revert; margin: 0px; padding: 0px; background-color: transparent;');

        this.#backgroundElement.appendChild(this.#canvasElement);
    }

    /**
     * @summary Insert the background element into the target element.
     * @param {HTMLElement} targetElement - The target element to insert into.
     */
    insertTo(targetElement) {
        targetElement.insertBefore(this.#backgroundElement, null);
        this.#canvasElement.width = document.documentElement.clientWidth;
        this.#canvasElement.height = document.documentElement.clientHeight;
    }

    /**
     * @summary Remove the background element from the target element.
     * @param {HTMLElement} targetElement - The target element to remove from.
     */
    removeFrom(targetElement) {
        if (targetElement && this.#backgroundElement && targetElement.contains(this.#backgroundElement)) {
            targetElement.removeChild(this.#backgroundElement);
        }
    }

    /**
     * @summary Draw a line from the previous point to the current point.
     * @param {Point} point - The current point.
     */
    drawLine(point) {
        if (this.#previousPoint) {
            const ctx = this.#canvasElement.getContext('2d');
            ctx.lineWidth = 4;
            if (this.#options.hideGestureLine) {
                ctx.strokeStyle = 'rgba(0, 0, 0, 0)';
            }
            else {
                ctx.strokeStyle = this.#options.gestureLineColor;
            }
            ctx.beginPath();
            ctx.moveTo(this.#previousPoint.x, this.#previousPoint.y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
            ctx.closePath();
        }

        this.#previousPoint = point;
    }

    /**
     * @summary Reset the canvas element.
     */
    reset() {
        if (this.#previousPoint) {
            const ctx = this.#canvasElement.getContext('2d');
            const element = document.documentElement;
            ctx.clearRect(0, 0, element.clientWidth, element.clientHeight);

            this.#previousPoint = undefined;
            this.#canvasElement.width = element.clientWidth;
            this.#canvasElement.height = element.clientHeight;
        }
    }
}

/**
 * @summary Class for showing arrows and action names.
 */
class ShowArrowsElement {
    /**
     * @type {ExtensionOptions | undefined}
     */
    #options = undefined;

    /**
     * @type {string}
     */
    #arrows = '';

    /**
     * @type {HTMLElement | undefined}
     */
    #backgroundElement = undefined;

    /**
     * @type {HTMLElement | undefined}
     */
    #actionNameAndArrowsElement = undefined;

    /**
     * @type {HTMLElement | undefined}
     */
    #actionNameArea = undefined;

    /**
     * @type {HTMLElement | undefined}
     */
    #arrowsArea = undefined;

    /**
     * @type {Window | undefined}
     * @description The window in which the mouse gesture was initiated.
     */
    #windowMouseGestureWasInitiated = undefined;

    /**
     * @constructor
     * @param {ExtensionOptions} options 
     */
    constructor(options) {
        this.#options = options;

        this.#backgroundElement = createBackgroundElement(true);
        if (this.#backgroundElement.style) {
            this.#backgroundElement.style.zIndex = 16777270;
            this.#backgroundElement.style.backgroundColor = 'transparent';
            this.#backgroundElement.style.pointerEvents = 'none'; // Needed to enable mouse gestures in certain IFRAMEs (mainly browser games)
        }

        window.addEventListener('message', (event) => {
            if (chrome.runtime && event.data.extensionId !== chrome.runtime.id) {
                return;
            }

            switch (event.data.type) {
                case 'show-arrows':
                    this.showArrows(global.arrows);
                    if (isInRootWindow() && this.#windowMouseGestureWasInitiated !== window) {
                        this.#windowMouseGestureWasInitiated = event.source;
                    }
                    break;
                case 'reset-gesture':
                    this.reset();
                    if (this.#windowMouseGestureWasInitiated) {
                        this.#windowMouseGestureWasInitiated.postMessage({ extensionId: chrome.runtime.id, type: 'reset-gesture' }, '*');
                        this.#windowMouseGestureWasInitiated = undefined;
                    }
                    break;
            }
        });
    }

    /**
     * @summary Show the arrows and action names.
     * @param {string} arrows - The arrows to show.
     */
    showArrows(arrows) {
        if (this.#arrows.length === 0) {
            this.#createActionNameAreaElementAndArrowsElement();
            document.body.appendChild(this.#backgroundElement);
        }
        this.#arrows = arrows;
        this.#arrowsArea.innerText = this.#arrows;

        const action = this.#options.getGestureAction(this.#arrows);
        if (action) {
            if (action.startsWith('customurl:')) {
                this.#actionNameArea.innerText = `${chrome.i18n.getMessage('opencustomurl')}:${action.substring(10)}`;
            }
            else if (action) {
                this.#actionNameArea.innerText = chrome.i18n.getMessage(action);
            }
            this.#actionNameArea.style.display = 'block';
            this.#actionNameArea.style.backgroundColor = this.#options.gestureBackgroundColor;
        }
        else {
            this.#actionNameArea.innerText = '';
            this.#actionNameArea.style.backgroundColor = 'rgba(0, 0, 0, 0)';
        }
    }

    /**
     * @summary Create the action name area and arrows area elements.
     */
    #createActionNameAreaElementAndArrowsElement() {
        this.#actionNameAndArrowsElement = createPositionElement(this.#options.showArrowsPosition);
        this.#backgroundElement.appendChild(this.#actionNameAndArrowsElement);
        this.#actionNameAndArrowsElement.style.pointerEvents = 'none';

        this.#actionNameArea = createActionNameAreaElement(this.#options);
        if (!this.#options.hideGestureText) {
            this.#actionNameAndArrowsElement.appendChild(this.#actionNameArea);
        }

        this.#arrowsArea = createArrowsAreaElement(this.#options);
        if (!this.#options.hideGestureArrow) {
            this.#actionNameAndArrowsElement.appendChild(this.#arrowsArea);
        }
    }

    /**
     * @summary Reset the ShowArrowsElement.
     */
    reset() {
        if (this.#arrows) {
            this.#arrows = '';
            this.#arrowsArea.innerText = this.#arrows;
            if (document.body.contains(this.#backgroundElement)) {
                document.body.removeChild(this.#backgroundElement);
            }
            if (this.#backgroundElement.contains(this.#actionNameAndArrowsElement)) {
                this.#backgroundElement.removeChild(this.#actionNameAndArrowsElement);
            }
        }
    }
}

/**
 * @summary Class for bookmark edit dialog elements.
 */
class BookMarkEditDialogElements {
    /**
     * @type {HTMLElement | undefined}
     */
    #targetElement = undefined;

    /**
     * @type {HTMLElement | undefined}
     */
    #backgroundElement = undefined;

    /**
     * @type {BookmarkTreeNode | undefined}
     */
    #existingBookmark = undefined;

    /**
     * @type {HTMLInputElement | undefined}
     */
    #nameInputElement = undefined;

    /**
     * @type {HTMLInputElement | undefined}
     */
    #urlInputElement = undefined;

    /**
     * @type {HTMLSelectElement | undefined}
     */
    #folderSelectElement = undefined;

    /**
     * @constructor
     */
    constructor() {
        this.on = {
            ok: this.onOk.bind(this),
            cancel: this.onCancel.bind(this),
            deleteBookmark: this.onDeleteBookmark.bind(this),
        };
    }

    /**
     * @summary Start the bookmark event listener.
     */
    start() {
        chrome.runtime.onMessage.addListener((request) => {
            if (request && request.extensionId === chrome.runtime.id && request.type === 'upsertbookmarkresponse') {
                (async () => {
                    if (!this.#targetElement) {
                        const data = await chrome.storage.sync.get(['defaultBookmarkFolder']);
                        this.addDialog(request.bookmarks, request.existsBookmark, data ? data.defaultBookmarkFolder : undefined);
                    }
                })();
            }
        });
    }

    /**
     * @summary Add the bookmark dialog.
     * @param {BookmarkTreeNode[]} bookmarks - The bookmarks to add.
     * @param {boolean} isEditMode - Whether to edit the bookmark or not.
     * @param {string} defaultBookmarkFolder - The folder selected when the dialog is opened.
     */
    addDialog(bookmarks, isEditMode, defaultBookmarkFolder) {
        this.#targetElement = document.body;
        this.addEventListeners();

        this.#existingBookmark = this.findBookmark(bookmarks, document.location.href);

        this.#backgroundElement = createBackgroundElement(true);
        this.#backgroundElement.style.zIndex = 16777271;
        this.#backgroundElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.#backgroundElement.addEventListener('click', (event) => {
            if (event.target === this.#backgroundElement) {
                this.onCancel(event);
            }
        });

        const centeringElement = createCenteringElement();
        this.#backgroundElement.appendChild(centeringElement);

        const dialogElement = document.createElement('div');
        dialogElement.setAttribute('style', 'all: revert; position: relative; background-color: white; padding: 2em;');
        centeringElement.appendChild(dialogElement);

        const cancelButton = document.createElement('a');
        cancelButton.href = '#';
        cancelButton.innerText = chrome.i18n.getMessage('strClose');
        cancelButton.setAttribute('style', 'all: revert; font-weight: bold; text-decoration: none; color: black; display: block; position: absolute; right: 1em; top: 1em;');
        cancelButton.addEventListener('click', this.on.cancel);
        dialogElement.appendChild(cancelButton);

        const titleBarElement = document.createElement('div');
        titleBarElement.setAttribute('style', 'all: revert');
        dialogElement.appendChild(titleBarElement);

        const titleElement = document.createElement('span');
        titleElement.innerText = isEditMode ? chrome.i18n.getMessage('strBookmarkDialogTitleEdit') : chrome.i18n.getMessage('strBookmarkDialogTitleAdd');
        titleElement.setAttribute('style', 'all: revert; margin-bottom: 1em;');
        titleBarElement.appendChild(titleElement);

        const tableElement = document.createElement('div');
        tableElement.setAttribute('style', 'all: revert; display: table; margin-bottom: 1em;');
        dialogElement.appendChild(tableElement);

        const rowNameElement = document.createElement('div');
        rowNameElement.setAttribute('style', 'all: revert; display: table-row;');
        tableElement.appendChild(rowNameElement);

        const nameRabelElement = document.createElement('div');
        nameRabelElement.setAttribute('style', 'all: revert; display: table-cell; padding: 1em;');
        nameRabelElement.innerText = chrome.i18n.getMessage('strBookmarkDialogName');
        rowNameElement.appendChild(nameRabelElement);

        const nameInputColumnElement = document.createElement('div');
        nameInputColumnElement.setAttribute('style', 'all: revert; display: table-cell;');
        rowNameElement.appendChild(nameInputColumnElement);

        this.#nameInputElement = document.createElement('input');
        this.#nameInputElement.setAttribute('style', 'all: revert; width: 40vw;');
        this.#nameInputElement.type = 'text';
        if (this.#existingBookmark) {
            this.#nameInputElement.value = this.#existingBookmark.title || '';
        }
        else {
            this.#nameInputElement.value = document.title;
        }
        nameInputColumnElement.appendChild(this.#nameInputElement);

        const rowUrlElement = document.createElement('div');
        rowUrlElement.setAttribute('style', 'all: revert; display: table-row;');
        tableElement.appendChild(rowUrlElement);

        const urlRabelElement = document.createElement('div');
        urlRabelElement.setAttribute('style', 'all: revert; display: table-cell; padding: 1em;');
        urlRabelElement.innerText = chrome.i18n.getMessage('strBookmarkDialogUrl');
        rowUrlElement.appendChild(urlRabelElement);

        const urlInputColumnElement = document.createElement('div');
        urlInputColumnElement.setAttribute('style', 'all: revert; display: table-cell;');
        rowUrlElement.appendChild(urlInputColumnElement);

        this.#urlInputElement = document.createElement('input');
        this.#urlInputElement.setAttribute('style', 'all: revert; width: 40vw;');
        this.#urlInputElement.type = 'text';
        this.#urlInputElement.value = this.#existingBookmark ? this.#existingBookmark.url : document.location.href;
        urlInputColumnElement.appendChild(this.#urlInputElement);

        const rowFolderElement = document.createElement('div');
        rowFolderElement.setAttribute('style', 'all: revert; display: table-row;');
        tableElement.appendChild(rowFolderElement);

        const folderRabelElement = document.createElement('div');
        folderRabelElement.setAttribute('style', 'all: revert; display: table-cell; padding: 1em;');
        folderRabelElement.innerText = chrome.i18n.getMessage('strBookmarkDialogFolder');
        rowFolderElement.appendChild(folderRabelElement);

        const folderSelectColumnElement = document.createElement('div');
        folderSelectColumnElement.setAttribute('style', 'all: revert; display: table-cell;');
        rowFolderElement.appendChild(folderSelectColumnElement);

        this.#folderSelectElement = document.createElement('select');
        this.#folderSelectElement.setAttribute('style', 'all: revert; width: 40vw;');
        folderSelectColumnElement.appendChild(this.#folderSelectElement);

        const parentIdOfexistingBookmark = this.#existingBookmark ? this.#existingBookmark.parentId : defaultBookmarkFolder;
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
                        optionElement.setAttribute('style', 'all: revert');
                        optionElement.innerText = node.title;
                        optionElement.value = node.id;
                        if (parentIdOfexistingBookmark === node.id) {
                            optionElement.selected = true;
                        }
                        this.#folderSelectElement.appendChild(optionElement);
                    }
                }
            }

            bookmarkNodes = nextBookmarkNodes;
        }

        const buttonsAreaElement = document.createElement('div');
        buttonsAreaElement.setAttribute('style', 'all: revert; display: grid; grid-template-columns: 1fr 1fr; plac-content: center; gap: 1ch;');
        dialogElement.appendChild(buttonsAreaElement);

        const deleteButtonColumn = document.createElement('div');
        deleteButtonColumn.setAttribute('style', 'all: revert; text-align: center;');
        buttonsAreaElement.appendChild(deleteButtonColumn);

        const deleteButton = document.createElement('a');
        deleteButton.innerText = chrome.i18n.getMessage('strDelete');
        deleteButton.href = '#';
        deleteButton.setAttribute('style', 'all: revert');
        deleteButton.addEventListener('click', this.on.deleteBookmark);
        deleteButtonColumn.appendChild(deleteButton);

        const okButtonColumn = document.createElement('div');
        okButtonColumn.setAttribute('style', 'all: revert; text-align: center;');
        buttonsAreaElement.appendChild(okButtonColumn);

        const okButton = document.createElement('button');
        okButton.innerText = chrome.i18n.getMessage('strOk');
        okButton.setAttribute('style', 'all: revert; width: 10em;');
        okButton.addEventListener('click', this.on.ok);
        okButtonColumn.appendChild(okButton);

        this.#targetElement.appendChild(this.#backgroundElement);
        this.#nameInputElement.focus();
        this.#nameInputElement.select();
    }

    /**
     * @summary Find a bookmark by URL.
     * @param {BookmarkTreeNode} bookmarks - Search destination bookmarks.
     * @param {string} url - The URL to search for.
     * @returns {BookmarkTreeNode} The found bookmark node.
     */
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

    /**
     * @summary Reset the bookmark dialog.
     */
    reset() {
        this.#targetElement.removeChild(this.#backgroundElement);
        this.#targetElement = undefined;
        this.#backgroundElement = undefined;
        this.#existingBookmark = undefined;
        this.#nameInputElement = undefined;
        this.#urlInputElement = undefined;
        this.#folderSelectElement = undefined;

        this.removeEventListeners();
    }

    /**
     * @summary Handle the OK button click event.
     * @param {Event} event - The event object.
     */
    onOk(event) {
        if (event.type === 'click' || event.key === 'Enter') {
            const newBookmark = {
                id: this.#existingBookmark ? this.#existingBookmark.id : undefined,
                title: this.#nameInputElement.value,
                url: this.#urlInputElement.value,
                parentId: this.#folderSelectElement.value
            };
            sendChromeMessage({ action: 'editbookmark', bookmark: newBookmark });
            this.reset();
            this.setDefaultBookmarkFolder(newBookmark.parentId);
        }
    }

    /**
     * @summary Handle the cancel button click event.
     * @param {Event} event - The event object.
     */
    onCancel(event) {
        if (event.type === 'click' || event.key === 'Escape') {
            event.preventDefault();
            this.reset();
        }
    }

    /**
     * @summary Handle the delete bookmark button click event.
     * @param {Event} event - The event object.
     */
    onDeleteBookmark(event) {
        event.preventDefault();
        sendChromeMessage({ action: 'deletebookmark', bookmark: { url: document.location.href } });
        this.reset();
    }

    /**
     * @summary Add event listeners for the OK and cancel buttons.
     */
    addEventListeners() {
        window.addEventListener('keydown', this.on.ok);
        window.addEventListener('keydown', this.on.cancel);
    }

    /**
     * @summary Remove event listeners for the OK and cancel buttons.
     */
    removeEventListeners() {
        window.removeEventListener('keydown', this.on.ok);
        window.removeEventListener('keydown', this.on.cancel);
    }

    /**
     * @summary Set the default bookmark folder.
     * @param {string} folderId - The ID of the folder to set as default.
     */
    setDefaultBookmarkFolder(folderId) {
        chrome.storage.sync.set({ defaultBookmarkFolder: folderId }).then();
    }
}
