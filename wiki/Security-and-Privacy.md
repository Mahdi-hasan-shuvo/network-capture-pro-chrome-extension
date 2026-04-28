# 🔐 Security & Privacy

A short, honest read.

## TL;DR

- ✅ **100% local.** Captures stay on your machine.
- ✅ **Zero telemetry.** No analytics, no error reporters, no remote pings.
- ✅ **Zero dependencies.** No npm packages = no supply-chain surface.
- ✅ **No remote hosts.** Audit `background.js` — no `fetch()` to anything outside the captured tab.
- ⚠️ **You are recording everything.** That includes passwords in POST bodies and auth tokens in headers. Treat capture archives like you'd treat a password manager export.

## What gets captured (and what doesn't)

### Captured ✅
- Every HTTP/S request and response from the active tab while recording
- Cookies (request + Set-Cookie)
- Query string parameters
- POST/PUT bodies — including form data and JSON
- Response headers and bodies (text & binary)
- Timing, remote IP, security details, WebSocket frames

### NOT captured ❌
- Other tabs (single-tab capture only)
- Other browsers / apps on your machine
- Anything when **Stop** has been pressed or the tab is closed
- Encrypted disk content, OS notifications, anything outside Chrome
- DNS lookups, raw TCP/TLS handshakes — only the application-layer view

## Data residency

Captured data lives in two places:

| Where | When | What |
|---|---|---|
| `chrome.storage.local` | While capturing / between sessions | All entries until you press **Clear** |
| Your **Downloads** folder | When you press an export button | The chosen ZIP/JSON/HAR/CSV file |

Nothing else. No cloud sync. No external backup.

## Why does it ask for `<all_urls>`?

Because `chrome.debugger` needs to attach to whichever site you're on, and you decide which site that is. The extension does **not** read pages or inject scripts — it only attaches the debugger when you click **Start**.

You can verify by reading [`manifest.json`](../manifest.json) and [`background.js`](../background.js). There are no `chrome.scripting.executeScript` calls and no content scripts.

## Capture archives are sensitive

Every export contains every cookie and every token from the captured tab. Treat them like password manager exports:

- Don't email them around in clear
- Don't paste them into public AI tools without redacting
- Encrypt them if you're storing them long-term
- Delete them once the bug is fixed

If you're sharing a capture for a bug report, consider:

- Stripping cookies / `authorization` headers from the per-request JSONs
- Replacing your real session ID with `<REDACTED>`
- Capturing on a **dummy account** instead of your real one

## Authorized testing only

If you use this for security research, only capture on systems you have permission to test. The yellow Chrome notice bar is a feature, not a bug — it makes it impossible to record someone covertly.

## Reporting a vulnerability

Please open a private security advisory on GitHub or email the maintainer (link in repo). Don't file public issues for security bugs.
