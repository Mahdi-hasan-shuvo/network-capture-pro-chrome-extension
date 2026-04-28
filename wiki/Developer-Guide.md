# 🛠️ Developer Guide

Want to hack on the source? Here's everything you need.

## Setup

```bash
git clone https://github.com/<your-username>/network-capture-pro-chrome-extension.git
cd network-capture-pro-chrome-extension
```

There is **no `npm install`** — there are no npm dependencies, no build step, no bundler. Edit a file, click ↻ on the extension card, refresh the page. That's the whole loop.

## The dev loop (10 seconds per iteration)

1. Edit a file
2. `chrome://extensions` → ↻ on the **Network Capture Pro** card
3. Reopen the popup or refresh the captured page
4. Watch logs in:
   - **Service worker logs** — `chrome://extensions` → "Inspect views: service worker"
   - **Popup logs** — right-click the popup → Inspect → Console
   - **Offscreen logs** — `chrome://extensions` → "Inspect views: offscreen.html"
   - **Panel logs** — open the panel → F12

## Code map

```
manifest.json        → permissions + entry points
background.js        → service worker (state, CDP, message routing)
  ├─ debugger.onEvent  → captures CDP events
  ├─ message router    → handles popup/panel actions
  ├─ saveState()       → debounced chrome.storage.local writes
  ├─ ensureOffscreen() → lazy-spawns offscreen doc
  └─ downloadAll()     → orchestrates the export flow

offscreen.js         → blob builders
  ├─ buildHar()
  ├─ buildCsv()
  ├─ buildIndexHtml()
  └─ buildBlob()       → returns blob URL to background

zip.js               → custom STORE-method ZIP writer
popup.html/css/js    → toolbar popup
panel.html/js        → full panel + DevTools panel
devtools.html/js     → DevTools panel registration
```

## Adding a new export format

Say you want to add a Markdown export. Three changes:

1. **`offscreen.js`** — add a `buildMd(entries, meta)` function and wire it in the `buildBlob` switch:
   ```js
   } else if (format === 'md') {
     const md = buildMd(entries, meta);
     const blob = new Blob([md], { type: 'text/markdown' });
     url = URL.createObjectURL(blob);
     filename = `network_capture_${ts}.md`;
   }
   ```
2. **`popup.html`** — add a button:
   ```html
   <button id="dlMd" class="btn">⬇ Markdown</button>
   ```
3. **`popup.js`** — wire it:
   ```js
   ui.dlMd.addEventListener('click', () => doDownload('md'));
   ```

Done. (Mirror the same in `panel.html` / `panel.js` if you want it in the full panel too.)

## Adding a new background message type

1. Pick a unique `type` constant — convention: SCREAMING_SNAKE_CASE
2. Add a `case` in the `chrome.runtime.onMessage.addListener` switch in `background.js`
3. Call `sendResponse({ ok: true, ... })` (or throw — the catch wraps it as `{ok:false,error:…}`)
4. Add `handlers: [...]` entry so popup's stale-SW check still passes
5. Call from popup/panel via `await send('YOUR_TYPE', { ...data })`

## Debugging tips

| Symptom | First thing to check |
|---|---|
| Popup says "Stale SW — reload" | Click ↻ on the extension card |
| `unknown message type X` | Same — your SW is old |
| Downloads fail silently | Inspect offscreen.html → check console |
| No requests captured | Was the yellow CDP bar visible? Was DevTools open on the same tab? |
| Response body missing | Some CDN/bigfile responses are too big for `Network.getResponseBody` — check `responseBodyError` field |

## Style conventions

- 2-space indent, single quotes, no semicolons skipped — match what's already there
- Avoid frameworks. Vanilla JS is the project's identity.
- Keep `background.js` and `offscreen.js` strict-mode compatible (they already are by default in MV3)
- Minimal comments — only when *why* isn't obvious from *what*

## Tests

There are no automated tests yet (PRs welcome — see [[Roadmap]]). Manual smoke test before submitting a PR:

1. Load unpacked
2. Capture 50+ requests from any SPA
3. Pause / resume / clear
4. Export ZIP — open `index.html`, click 5 random rows, confirm bodies render
5. Export HAR — drop into Chrome DevTools → import → confirm requests show with bodies
6. Export CSV — open in a spreadsheet — column count matches header
7. Clear cookies + Hard reload — confirm cookies are gone and page re-fetches all assets
