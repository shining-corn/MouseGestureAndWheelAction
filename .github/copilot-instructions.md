# Development Context

## Project overview
This repository contains a Chrome/Edge extension named Mouse Gesture and Wheel Action. The extension uses a Manifest V3 background service worker and content scripts to handle mouse gestures, wheel actions, and rocker gestures across web pages.

## When working on this repository
- Prefer small, targeted changes that match the existing extension architecture.
- Preserve the current naming patterns and module boundaries.
- Avoid unrelated behavior changes when implementing a feature or bug fix.

## Files to inspect first
- src/content.js: main client-side gesture handling and event flow.
- src/gestureActions.js: action registry, action IDs, and action implementations.
- src/service-worker.js: background tab/window/bookmark logic.
- src/manifest.json: extension permissions, metadata, and entry points.
- src/options.{html,js}: extension settings page UI and logic.
- src/_locales/{en,ja,zh_CN}/messages.json: Localization files.

## Typical implementation workflow for a new action
1. Add the action entry in src/gestureActions.js under the appropriate category.
2. Use a descriptive, stable action ID.
3. If the action needs background behavior, send a message from the content-side flow to the service worker.
4. Add the corresponding background handler in src/service-worker.js when needed.
5. Add localized UI text in every locale file.
6. Update src/manifest.json if new permissions or extension capabilities are required.
7. Verify there are no syntax or diagnostics errors in the edited files.

## Important conventions
- Keep action IDs consistent and future-proof.
- Use the existing action registry pattern instead of introducing a separate mechanism.
- Use chrome.i18n.getMessage(...) for user-facing strings.
- Prefer the service worker for tab, window, bookmark, and download operations.
- Do not assume a new action should be implemented in the options page unless the UI must expose it.

## Verification expectations
- If behavior changes, verify the relevant files remain syntactically valid.
