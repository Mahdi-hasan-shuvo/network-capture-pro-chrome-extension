# Contributing to Network Capture Pro

First off — thank you! 🙌 This project is intentionally small (vanilla JS, no build step, no dependencies), so it's genuinely easy to contribute to. This guide gets you productive in a few minutes.

By participating, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 🧰 Prerequisites

- **Google Chrome 116+** (or a Chromium browser: Edge, Brave, Vivaldi, Opera, Arc)
- **git**

There is **no `npm install`** — there are no npm dependencies, no bundler and no build step.

---

## 🚀 Local setup

```bash
git clone https://github.com/Mahdi-hasan-shuvo/network-capture-pro-chrome-extension.git
cd network-capture-pro-chrome-extension
```

1. Open `chrome://extensions`
2. Toggle **Developer mode** (top-right)
3. Click **Load unpacked** and select the project folder
4. Pin the extension to your toolbar

## 🔁 The dev loop (≈10 seconds per iteration)

1. Edit a file
2. Go to `chrome://extensions` → click ↻ on the **Network Capture Pro** card
3. Reopen the popup or refresh the page you're capturing

Logs live in different places depending on the context:

| Context | Where to find logs |
|---|---|
| Service worker (`background.js`) | `chrome://extensions` → "Inspect views: service worker" |
| Offscreen (`offscreen.js`) | `chrome://extensions` → "Inspect views: offscreen.html" |
| Popup | Right-click the popup → Inspect → Console |
| Panel / DevTools tab | Open the panel → F12 |

---

## 🗺️ Code map

| File | Responsibility |
|---|---|
| `manifest.json` | MV3 manifest: permissions + entry points |
| `background.js` | Service worker — CDP attach/detach, event handler, persistence, message router, downloads, `browsingData` |
| `offscreen.html` / `offscreen.js` | Builds ZIP/JSON/HAR/CSV blobs (service workers can't create blob URLs in MV3) |
| `zip.js` | Hand-written STORE-method ZIP writer, exposed as `globalThis.NCPZip` |
| `popup.html` / `popup.css` / `popup.js` | Compact toolbar UI |
| `panel.html` / `panel.js` | Full panel (also serves as the DevTools tab) |
| `devtools.html` / `devtools.js` | Registers the "Network Capture" DevTools tab |

Architecture deep-dive: [How It Works](https://github.com/Mahdi-hasan-shuvo/network-capture-pro-chrome-extension/wiki/How-It-Works) and the [Developer Guide](https://github.com/Mahdi-hasan-shuvo/network-capture-pro-chrome-extension/wiki/Developer-Guide) in the wiki.

---

## 🧩 Common tasks

### Add a new export format

1. In `offscreen.js`, add a `buildXxx(entries, meta)` function and a branch for it in `buildBlob()`.
2. In `popup.html` / `popup.js`, add a button and wire it with `doDownload('xxx')`.
3. Mirror it in `panel.html` / `panel.js` to expose it in the full panel too.

> If you change the per-request file naming inside the ZIP, update it in **both** `buildBlob()` and `buildIndexHtml()` — the index links are generated separately.

### Add a new background message type

1. Add a `case` to the `switch` in the `chrome.runtime.onMessage` listener in `background.js`.
2. Respond with `sendResponse({ ok: true, ... })` (a thrown error is wrapped as `{ ok: false, error }`).
3. Add the name to the `handlers` array returned by `GET_STATE`.
4. Call it from the UI with `send('YOUR_TYPE', { ...data })`.

---

## ✅ Manual smoke test (before opening a PR)

There is no automated test suite yet (contributions welcome). Please verify:

1. Load unpacked and capture 50+ requests from any SPA.
2. Pause / Resume / Clear all work.
3. Export **ZIP** → open `index.html`, click a few rows, confirm bodies render.
4. Export **HAR** → import into Chrome DevTools → confirm requests show with bodies.
5. Export **CSV** → open in a spreadsheet → column count matches the header.
6. **Clear cookies** + **Hard reload** → cookies are gone and assets re-fetch.

---

## 🎨 Style conventions

- 2-space indentation, single quotes, semicolons — match the surrounding code.
- **No frameworks, no dependencies, no build step.** Vanilla JS is the project's identity.
- Keep comments minimal — only where the *why* isn't obvious from the *what*.
- No network calls, analytics, or CDN resources. Everything stays local.

---

## 🔀 Pull request process

1. Fork the repo and create a branch: `git checkout -b feature/short-description`
2. Make your change and run the manual smoke test above.
3. Keep PRs focused — one logical change per PR.
4. Fill in the PR template and describe what you changed and how you tested it.
5. Link any related issue (`Closes #123`).

For anything larger than a small fix, please [open an issue](https://github.com/Mahdi-hasan-shuvo/network-capture-pro-chrome-extension/issues/new/choose) first so we can agree on the approach.

---

## 💡 Reporting bugs & requesting features

- 🐛 [Bug report](https://github.com/Mahdi-hasan-shuvo/network-capture-pro-chrome-extension/issues/new/choose)
- ✨ [Feature request](https://github.com/Mahdi-hasan-shuvo/network-capture-pro-chrome-extension/issues/new/choose)
- 🔒 Security issues: please follow the [Security Policy](SECURITY.md) instead of opening a public issue.

Thanks for making Network Capture Pro better! ⭐
