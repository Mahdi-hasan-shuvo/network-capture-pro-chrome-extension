# 🔑 Permissions Explained

The full list, with the *exact* reason each one exists.

| Permission | Why we need it | Could we drop it? |
|---|---|---|
| `debugger` | The only API that returns full response bodies (via `Network.getResponseBody`). The whole project depends on this. | No — this is the core. |
| `<all_urls>` | Lets the debugger attach to whichever tab you choose to capture. | Only by replacing it with `activeTab`, which is more limited. |
| `storage` | Persists captured requests across service-worker restarts. Without it, evicting the SW would lose your in-progress capture. | No — MV3 SWs *will* be evicted; we need persistence. |
| `downloads` | Saves your ZIP / JSON / HAR / CSV files to disk. | No — alternative is right-click → Save As, which is a worse UX. |
| `tabs` | Reads the URL of the captured tab so we know what site you're on (for the "Target site" row). | We could use only `activeTab`, but then we'd lose context after switching windows. |
| `activeTab` | Lets us trigger captures on the current tab without a host-permission warning the first time. | Pairs with `tabs`. |
| `cookies` | Reserved for upcoming "list all cookies on this site" feature; currently unused at runtime. | Yes — drop in a future release if the feature isn't built. |
| `browsingData` | Powers the **Clear cookies** and **Clear cache** buttons (origin-scoped). | Only by removing those buttons. |
| `offscreen` | Required to create blob URLs in MV3 — service workers can't do it themselves. | No — without it, downloads can't work. |
| `webNavigation` | Reserved for upcoming auto-attach mode (capture starts the moment a tab opens). | Yes — currently unused; will be used in the next minor release. |
| `scripting` | Reserved for upcoming "inject a marker / replay a request" feature. | Yes — currently unused. |

## What we deliberately do **not** ask for

- ❌ `webRequest` / `webRequestBlocking` — we use CDP instead, which gives us bodies
- ❌ `nativeMessaging` — no native binaries
- ❌ `notifications` — no popups
- ❌ `clipboardWrite` — copy buttons would only need short-term clipboard access; we don't have any
- ❌ `unlimitedStorage` — captures fit in the standard local quota; if you need bigger, you should be exporting

## What you should sanity-check before installing any extension that asks for `debugger`

The `debugger` permission is **powerful** — it can read and modify everything on the captured page. Always:

1. Check that the source code is open and matches what's loaded
2. Verify the network tab in `chrome://extensions → Inspect views: service worker` shows no outgoing requests to remote hosts
3. Look for `fetch(` / `XMLHttpRequest` / `WebSocket` / `navigator.sendBeacon` calls in the background script — there should be **none** here

This extension is open source precisely so you can verify all of the above.
