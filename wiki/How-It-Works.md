# 🧠 How It Works

A guided tour of the architecture, from "user clicks Start" to "ZIP lands in Downloads."

## 🏗 Architecture diagram

```
┌─────────────────────┐         ┌─────────────────────┐
│   Popup / Panel /   │ ◀─msg─▶ │  Service Worker     │
│   DevTools UI       │         │  (background.js)    │
└─────────────────────┘         └──────────┬──────────┘
                                           │
                                  attach   │  Network.* events
                                           ▼
                                ┌─────────────────────┐
                                │  Captured Tab       │
                                │  (Chrome DevTools   │
                                │   Protocol target)  │
                                └─────────────────────┘
                                           ▲
                                           │
                                  storage  │  download via blob URL
                                           │
                                ┌──────────┴──────────┐
                                │  Offscreen Document │
                                │  (offscreen.js)     │
                                │  builds ZIP/HAR/CSV │
                                └─────────────────────┘
```

## 🎬 What happens when you press Start

1. Popup → background: `{type: 'START'}`
2. Background calls `chrome.debugger.attach({tabId}, '1.3')`
3. Chrome shows the yellow "is being debugged" bar — required by Chrome's security policy
4. Background calls `Network.enable` with bigger buffers (50 MB / 200 MB)
5. State flips to `capturing: true`, badge becomes **REC**, save to `chrome.storage.local`

## 📡 What happens during a request

The CDP fires events in this order:

| CDP event | What we save |
|---|---|
| `Network.requestWillBeSent` | URL · method · request headers · post body · initiator · resource type · parsed query params |
| `Network.requestWillBeSentExtraInfo` | Full headers (incl. Cookie), associated cookies, connect timing |
| `Network.responseReceived` | Status · response headers · MIME · remote IP · protocol · timing |
| `Network.responseReceivedExtraInfo` | Final headers, blocked cookies, partition key, raw header text |
| `Network.loadingFinished` | Encoded data length · then we call `Network.getResponseBody` to fetch the body |
| `Network.loadingFailed` | Error text, blocked reason, CORS error |

Each event merges into the same in-memory entry keyed by CDP `requestId`. Throttled `chrome.storage.local` saves run every ~1.5 s so the SW can be evicted without losing data.

## 💾 Why we use an offscreen document for downloads

In Manifest V3, **service workers can't create `blob:` URLs** (no `URL.createObjectURL` for blobs). And `chrome.downloads.download` needs a URL.

Solution: an [offscreen document](https://developer.chrome.com/docs/extensions/reference/api/offscreen) registered with `reasons: ['BLOBS']`. It builds the file (ZIP/JSON/HAR/CSV) as a `Blob`, calls `URL.createObjectURL(blob)`, and replies to background with that URL. Background then calls `chrome.downloads.download({ url, filename })`. After 90 s, background asks offscreen to revoke the URL.

## 🗜 The ZIP writer

To stay dependency-free we ship a tiny ~100-line **STORE-method** (no compression) ZIP writer in [zip.js](../zip.js). It implements:

- Local file headers (`0x04034b50`)
- Central directory headers (`0x02014b50`)
- End-of-central-directory record (`0x06054b50`)
- CRC32 checksum table
- DOS time/date encoding
- UTF-8 filenames (flag bit 11)

It produces ZIPs that unzip in every tool I've tested (Windows Explorer, macOS Finder, 7-Zip, `unzip`, `jar`, browsers' download viewers).

## 🔄 Persistence across SW eviction

MV3 service workers are evicted after ~30 s idle. We mitigate this by:

1. Saving every captured event to `chrome.storage.local` (throttled to 1.5 s)
2. On SW startup, restoring `state.requests` from storage
3. If `state.capturing` was `true` when the SW died, marking the capture as ended (the debugger session is gone)

So if you start a 2-hour capture and Chrome puts the SW to sleep between bursts, you don't lose anything.

## 🧩 File responsibilities

| File | Lines | Responsibility |
|---|---:|---|
| `manifest.json` | 30 | MV3 declaration, permissions, entry points |
| `background.js` | 560 | CDP attach/detach, event handler, persistence, message router, downloads orchestration, browsingData |
| `offscreen.js` | 220 | ZIP/HAR/CSV/JSON builders, blob creation |
| `offscreen.html` | 4 | Minimal host for offscreen scripts |
| `zip.js` | 100 | STORE-method ZIP writer |
| `popup.html / .css / .js` | 350 | Compact toolbar UI |
| `panel.html / .js` | 270 | Full split-view UI (also serves as DevTools panel) |
| `devtools.html / .js` | 10 | Registers the DevTools tab |
