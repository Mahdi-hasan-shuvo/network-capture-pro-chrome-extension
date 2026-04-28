# 📥 Installation

There are two ways to install Network Capture Pro:

## 🅐 From source (recommended for now)

```bash
git clone https://github.com/<your-username>/network-capture-pro-chrome-extension.git
```

1. Open Chrome and visit `chrome://extensions`
2. Toggle **Developer mode** (top-right corner)
3. Click **Load unpacked**
4. Pick the cloned folder
5. Pin the extension to your toolbar (puzzle icon → 📌)

You're done. Click the icon to open the popup.

> ✅ **Tip** — when you `git pull` updates, click the ↻ refresh icon on the extension's card to reload the service worker, otherwise you'll be running a mix of old and new code.

## 🅑 From the Chrome Web Store

_Coming soon_ — submission in progress. Once published, the link will appear here and in the README.

## 🧪 Verifying your install

Open the popup. You should see:

- The current **version badge** (e.g. `v1.1.0`) next to the name
- A **● Start** button (green when idle)
- A **Target site** row showing your current tab's URL

If the version badge is missing, the popup couldn't reach the service worker — see [[Troubleshooting]].

## 🧰 Requirements

- **Chrome 116** or newer (uses the offscreen-documents `BLOBS` reason and CDP `1.3`)
- **~5 MB** of free `chrome.storage.local` quota
- **Permission to attach the debugger** to a tab — Chrome will show a yellow notice bar when capture is running. This is required and unavoidable; it's a security feature, not a bug.

## 🌐 Other Chromium browsers

The extension is pure MV3 with no Chrome-only APIs apart from `chrome.debugger`, so it should also work on **Edge**, **Brave**, **Vivaldi**, **Opera** and **Arc**. Reports welcome — please open an issue if you try one of these.
