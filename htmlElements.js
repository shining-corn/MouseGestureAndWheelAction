/**
 * @file Mouse Gesture Elements
 * @description This file contains the elements used for content.js.
 */

/**
 * @import { ExtensionOptions } from './ExtensionOptions.js';
 * @import { Point } from './utilities.js';
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

/**
 * @summary Create a centering element.
 * @returns The created element.
 */
function createCenteringElement() {
    const element = document.createElement('div');
    element.style.all = 'revert';
    element.style.maxWidth = '100vw';
    element.style.width = 'fit-content';
    element.style.height = 'fit-content';

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
        this.#backgroundElement.style.zIndex = 16777271;
        this.#backgroundElement.style.backgroundColor = 'transparent';

        this.#canvasElement = document.createElement('canvas');
        this.#canvasElement.style.all = 'revert';
        this.#canvasElement.style.margin = '0px';
        this.#canvasElement.style.padding = '0px';
        this.#canvasElement.style.backgroundColor = 'transparent';

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
        targetElement.removeChild(this.#backgroundElement);
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
    #centeringElement = undefined;

    /**
     * @type {HTMLElement | undefined}
     */
    #actionNameArea = undefined;

    /**
     * @type {HTMLElement | undefined}
     */
    #arrowsArea = undefined;

    /**
     * @constructor
     * @param {ExtensionOptions} options 
     */
    constructor(options) {
        this.#options = options;

        this.#backgroundElement = createBackgroundElement(true);
        this.#backgroundElement.style.zIndex = 16777270;
        this.#backgroundElement.style.backgroundColor = 'transparent';
        this.#backgroundElement.style.pointerEvents = 'none'; // 特定のIFRAME（主にブラウザゲーム）でマウスジェスチャ可能にするために必要

        this.#centeringElement = createCenteringElement();
        this.#backgroundElement.appendChild(this.#centeringElement);
        this.#centeringElement.style.textAlign = 'center';
        this.#centeringElement.style.pointerEvents = 'none';

        this.#actionNameArea = document.createElement('div');
        this.#centeringElement.appendChild(this.#actionNameArea);
        this.#actionNameArea.style.all = 'revert';
        this.#actionNameArea.style.width = 'fit-content';
        this.#actionNameArea.style.height = 'fit-content';
        this.#actionNameArea.style.margin = '0px';
        this.#actionNameArea.style.border = 'none';
        this.#actionNameArea.style.lineHeight = '1';
        this.#actionNameArea.style.fontFamily = 'BIZ UDPGothic';
        this.#actionNameArea.style.backgroundColor = this.#options.gestureBackgroundColor;
        this.#actionNameArea.style.display = 'none';
        this.#actionNameArea.style.pointerEvents = 'none';

        this.#arrowsArea = document.createElement('div');
        this.#centeringElement.appendChild(this.#arrowsArea);
        this.#arrowsArea.style.all = 'revert';
        this.#arrowsArea.style.fontWeight = 'bold';
        this.#arrowsArea.style.left = '0';
        this.#arrowsArea.style.right = '0';
        this.#arrowsArea.style.margin = 'auto';
        this.#arrowsArea.style.border = 'none';
        this.#arrowsArea.style.lineHeight = '1';
        this.#arrowsArea.style.fontFamily = 'monospace';
        this.#arrowsArea.style.backgroundColor = this.#options.gestureBackgroundColor;
        this.#arrowsArea.style.maxWidth = 'calc(100vw - 64px)';
        this.#arrowsArea.style.width = 'fit-content';
        this.#arrowsArea.style.height = 'fit-content';
        this.#arrowsArea.style.overflowWrap = 'anywhere';
        this.#arrowsArea.style.pointerEvents = 'none';

        window.addEventListener('message', (event) => {
            if (event.data.extensionId !== chrome.runtime.id) {
                return;
            }

            switch (event.data.type) {
                case 'show-arrows':
                    this.showArrows(event.data.arrows);
                    break;
                case 'reset-gesture':
                    this.reset();
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
            if (this.#options.hideGestureText) {
                this.#actionNameArea.style.color = 'rgba(0, 0, 0, 0)';
            }
            else {
                this.#actionNameArea.style.color = this.#options.gestureFontColor;
            }

            if (this.#options.hideGestureBackground || this.#options.hideGestureText) {
                this.#actionNameArea.style.backgroundColor = 'rgba(0, 0, 0, 0)';
            }
            else {
                this.#actionNameArea.style.backgroundColor = this.#options.gestureBackgroundColor;
            }

            this.#actionNameArea.style.fontSize = `${this.#options.gestureTextFontSize}px`;
            this.#actionNameArea.style.padding = `${Math.floor(this.#options.gestureTextFontSize) / 3}px`;

            if (this.#options.hideGestureArrow) {
                this.#arrowsArea.style.color = 'rgba(0, 0, 0, 0)';
            }
            else {
                this.#arrowsArea.style.color = this.#options.gestureArrowColor;
            }

            if (this.#options.hideGestureBackground || this.#options.hideGestureArrow) {
                this.#arrowsArea.style.backgroundColor = 'rgba(0, 0, 0, 0)';
            }
            else {
                this.#arrowsArea.style.backgroundColor = this.#options.backgroundColor;
            }

            this.#arrowsArea.style.fontSize = `${this.#options.gestureArrowFontSize}px`;
            this.#arrowsArea.style.padding = `${Math.floor(this.#options.gestureArrowFontSize / 8)}px`;

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
            this.#actionNameArea.style.display = 'inline';
            this.#arrowsArea.style.marginTop = '10px';
        }
        else {
            this.#actionNameArea.style.display = 'none';
            this.#arrowsArea.style.marginTop = '35px';
        }
    }

    /**
     * @summary Reset the ShowArrowsElement.
     */
    reset() {
        if (this.#arrows) {
            this.#arrows = '';
            this.#arrowsArea.innerText = this.#arrows;
            document.body.removeChild(this.#backgroundElement);
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
                        const data = await chrome.storage.local.get(['defaultBookmarkFolder']);
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

        this.#nameInputElement = document.createElement('input');
        this.#nameInputElement.style.all = 'revert';
        this.#nameInputElement.type = 'text';
        this.#nameInputElement.style.width = '40vw';
        if (this.#existingBookmark) {
            this.#nameInputElement.value = this.#existingBookmark.title || '';
        }
        else {
            this.#nameInputElement.value = document.title;
        }
        nameInputColumnElement.appendChild(this.#nameInputElement);

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

        this.#urlInputElement = document.createElement('input');
        this.#urlInputElement.style.all = 'revert';
        this.#urlInputElement.type = 'text';
        this.#urlInputElement.style.width = '40vw';
        this.#urlInputElement.value = this.#existingBookmark ? this.#existingBookmark.url : document.location.href;
        urlInputColumnElement.appendChild(this.#urlInputElement);

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

        this.#folderSelectElement = document.createElement('select');
        this.#folderSelectElement.style.all = 'revert';
        this.#folderSelectElement.style.width = '40vw';
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
                        optionElement.style.all = 'revert';
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
        chrome.storage.local.set({ defaultBookmarkFolder: folderId }).then();
    }
}
