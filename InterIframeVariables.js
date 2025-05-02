/**
 * @file InterIframeVariables.js
 * @description Class to manage variables that need to be shared between iframes.
 */

/**
 * @summary Class for managing inter-iframe variables.
 */
class InterIframeVariables {
    /**
     * @constructor
     */
    constructor() {
        this.variables = {
            shouldPreventContextMenu: false,
            selectedText: undefined,
            enabledExtension: true,
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
                    break;
            }
        });
    }

    /**
     * @summary Registers the current iframe to the root window.
     */
    registerToRootWindow() {
        getRootWindow().postMessage({ extensionId: chrome.runtime.id, type: 'mouse-extension-register' }, '*');
    }

    /**
     * @summary Synchronizes the variables with all registered windows.
     */
    sync() {
        for (const w of this.syncTargets) {
            w.postMessage(
                { extensionId: chrome.runtime.id, type: 'mouse-extension-sync', variables: this.variables },
                '*'
            );
        }
    }

    /**
     * @summary Sets shouldPreventContextMenu.
     * @param {boolean} shouldPreventContextMenu - Whether to prevent the context menu.
     */
    set shouldPreventContextMenu(should) {
        this.variables.shouldPreventContextMenu = should;
        this.sync();
    }

    /**
     * @summary Gets shouldPreventContextMenu.
     * @returns {boolean} - Whether to prevent the context menu.
     */
    get shouldPreventContextMenu() {
        return this.variables.shouldPreventContextMenu;
    }

    /**
     * @summary Sets selectedText.
     * @param {string} text - The selected text.
     */
    set selectedText(text) {
        this.variables.selectedText = text;
        this.sync();
    }

    /**
     * @summary Gets selectedText.
     * @returns {string} - The selected text.
     */
    get selectedText() {
        return this.variables.selectedText;
    }

    /**
     * @summary Sets enabledExtension.
     * @param {boolean} enabled - Whether the extension is enabled.
     */
    set enabledExtension(enabled) {
        this.variables.enabledExtension = enabled;
        this.sync();
    }

    /**
     * @summary Gets enabledExtension.
     * @returns {boolean} - Whether the extension is enabled.
     */
    get enabledExtension() {
        return this.variables.enabledExtension;
    }
};
