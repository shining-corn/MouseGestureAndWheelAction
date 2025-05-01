/**
 * @file InterIframeVariables.js
 * @description Class to manage variables that need to be shared between iframes.
 */

class InterIframeVariables {
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

    set enabledExtension(enabled) {
        this.variables.enabledExtension = enabled;
        this.sync();
    }

    get enabledExtension() {
        return this.variables.enabledExtension;
    }
};
