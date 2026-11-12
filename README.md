<div align="center">

# 🌐 Network Capture Pro

### A zero-dependency Chrome extension that captures **every network request** on any tab — and exports the whole session as a ready-to-share **ZIP / JSON / HAR / CSV** in one click.

**Headers · Cookies · Query params · POST body · Response body · Set-Cookie · Timings · WebSocket frames — every request, every byte.**

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-4285F4?style=flat-square&logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Chrome 116+](https://img.shields.io/badge/Chrome-116%2B-yellow?style=flat-square&logo=googlechrome&logoColor=white)](https://www.google.com/chrome/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![No Dependencies](https://img.shields.io/badge/dependencies-0-success?style=flat-square)](#-tech-stack)
[![GitHub stars](https://img.shields.io/github/stars/Mahdi-hasan-shuvo/network-capture-pro-chrome-extension?style=flat-square&logo=github)](https://github.com/Mahdi-hasan-shuvo/network-capture-pro-chrome-extension/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Mahdi-hasan-shuvo/network-capture-pro-chrome-extension?style=flat-square&logo=github)](https://github.com/Mahdi-hasan-shuvo/network-capture-pro-chrome-extension/network/members)
[![GitHub issues](https://img.shields.io/github/issues/Mahdi-hasan-shuvo/network-capture-pro-chrome-extension?style=flat-square&logo=github)](https://github.com/Mahdi-hasan-shuvo/network-capture-pro-chrome-extension/issues)
[![Last commit](https://img.shields.io/github/last-commit/Mahdi-hasan-shuvo/network-capture-pro-chrome-extension?style=flat-square)](https://github.com/Mahdi-hasan-shuvo/network-capture-pro-chrome-extension/commits/main)

[**Quick Start**](#-quick-start) · [**Features**](#-feature-highlights) · [**Export Formats**](#-export-formats) · [**Wiki**](https://github.com/Mahdi-hasan-shuvo/network-capture-pro-chrome-extension/wiki) · [**FAQ**](#-faq) · [**Contributing**](CONTRIBUTING.md)

</div>

---

## 🎥 Demo

https://github.com/user-attachments/assets/136cc793-11bb-414d-b2f3-030d36b40da3

---

## 📑 Table of Contents

- [Why Network Capture Pro?](#-why-network-capture-pro)
- [Feature Highlights](#-feature-highlights)
- [Quick Start](#-quick-start)
- [What's inside the ZIP?](#-whats-inside-the-zip)
- [Export Formats](#-export-formats)
- [Use Cases](#-use-cases)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Permissions Explained](#-permissions-explained)
- [FAQ](#-faq)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [Security & Privacy](#-security--privacy)
- [License](#-license)
- [Author & Contact](#-author--contact)

---

## ✨ Why Network Capture Pro?

Chrome DevTools' Network panel is great — until you close it. Then everything's gone. HAR exports lose response bodies. Most browser extensions only see headers.

**Network Capture Pro** uses the **Chrome DevTools Protocol** (the same engine that powers DevTools itself) to record **the full request *and* response**, including binary response bodies, decoded cookies, parsed JSON/form post data, redirects and WebSocket frames — and packages it into a browsable ZIP archive you can send to your team, attach to a bug report, replay in Postman, or feed into your own scripts.

> One click → a ZIP that contains **every request as its own file**, every response body saved with the right extension (`.json`, `.html`, `.png`, `.bin`…), a CSV summary, a HAR for DevTools, and an `index.html` you can open and click through. Zero external libraries. Zero telemetry.

---

## 🎯 Feature Highlights

| | |
|---|---|
| 📡 **Full request capture** | URL · method · all headers · cookies · query params · POST body (raw + parsed JSON / form) · initiator · frame · resource type |
| 📥 **Full response capture** | Status · status text · all headers · `Set-Cookie` (parsed into objects) · MIME · remote IP:port · protocol · timings · security details · **response body (text or base64 binary)** |
| ⚡ **One-click ZIP export** | Per-request `.json` files, raw response bodies, post-data, cookies, summary, HAR, CSV, and a clickable `index.html` — all in one archive |
| 📊 **Multiple export formats** | **ZIP** · **JSON** · **HAR** (for Postman/Charles/DevTools) · **CSV** (for Excel/Sheets) |
| 🎛️ **Live controls** | Start · Pause · Resume · Stop · Clear — with live request counter, byte counter, elapsed timer, and a recording badge on the toolbar icon |
| 🔍 **Smart filters** | Filter by URL, method, status, MIME, or resource type — same filters in popup and full panel |
| 🪟 **Three UIs** | Compact toolbar **popup** · full-page **panel** · embedded **DevTools tab** |
| 🍪 **Site-data tools** | One-click **Clear cookies** and **Clear cache** for the target origin (no need to nuke everything) |
| 🔁 **Tab tools** | Open / focus the captured tab · Reload · Hard reload (bypass cache) |
| 💾 **Survives SW restarts** | All requests persisted to `chrome.storage.local` — you won't lose a long capture if Chrome puts the service worker to sleep |
| 🛡️ **Privacy-first** | 100% local. Zero network calls. Zero analytics. Zero dependencies. Works offline. |

---

## 🚀 Quick Start

### 1. Install (unpacked)

```bash
git clone https://github.com/Mahdi-hasan-shuvo/network-capture-pro-chrome-extension.git
```

1. Open Chrome and visit `chrome://extensions`
2. Toggle **Developer mode** (top-right)
3. Click **Load unpacked**
4. Select the cloned folder
5. Pin the extension to the toolbar — done!

> Need more detail? See the [Installation guide](https://github.com/Mahdi-hasan-shuvo/network-capture-pro-chrome-extension/wiki/Installation) in the wiki.

### 2. Capture a session

1. Open the website you want to inspect
2. Click the **Network Capture Pro** icon
3. Press **● Start** — Chrome shows a yellow "this tab is being debugged" notice (required by the DevTools Protocol; leave it alone)
4. Use the website normally — log in, click around, submit forms…
5. Press **■ Stop**
6. Press **⬇ ZIP** — a complete archive lands in your Downloads folder

### 3. Read the capture

Unzip it, open `index.html` in your browser, and click any request to see its full JSON. Or:

- Open `capture.har` in Chrome DevTools / Postman / Charles / Insomnia
- Open `capture.csv` in Excel / Google Sheets
- Drop `all_requests.json` into your favourite jq / Python / Node script

<div align="center">

```
┌──────────────────────────────────────┐
│  ● Network Capture Pro      v1.1.0    │
├──────────────────────────────────────┤
│  Requests │ Elapsed │  Data │ Started │
│    142    │  03:21  │ 2.4MB │ 14:02   │
├──────────────────────────────────────┤
│  [● Start] [‖ Pause] [■ Stop] [Clear] │
├──────────────────────────────────────┤
│  Download                             │
│  [⬇ ZIP] [⬇ JSON] [⬇ HAR] [⬇ CSV]     │
├──────────────────────────────────────┤
│  Target site                          │
│  Site: https://example.com/login      │
│  [Open/focus] [Reload] [Hard reload]  │
│  [Clear cookies] [Clear cache]        │
├──────────────────────────────────────┤
│  Filter: [____] [All types ▾] [GET ▾] │
│  GET   200  example.com/api/me  120ms │
│  POST  201  example.com/login   340ms │
│  GET   304  example.com/style.css 8ms │
└──────────────────────────────────────┘
```

<sub>Text mockup of the toolbar popup. Watch the <a href="#-demo">demo video</a> above to see the real UI.</sub>

</div>

---

## 📦 What's inside the ZIP?

```
network_capture_2026-04-28T14-02-33Z.zip
├─ index.html                    ← clickable browsable summary
├─ summary.json                  ← capture metadata (start/end/bytes/tab)
├─ all_requests.json             ← every request in one big file
├─ capture.har                   ← HAR 1.2 — open in DevTools/Postman
├─ capture.csv                   ← spreadsheet-friendly summary
├─ counter_and_time.txt          ← human-readable counter & timings
│
├─ requests/                     ← one JSON per request, with EVERYTHING
│   ├─ 00001_example.com_GET.json
│   ├─ 00002_api.example.com_POST.json
│   └─ …
│
├─ bodies/                       ← raw response bodies, correct extension
│   ├─ 00001_example.com.html
│   ├─ 00002_api.example.com.json
│   ├─ 00003_cdn.example.com.png
│   └─ …
│
├─ post_data/                    ← raw POST/PUT bodies
│   └─ 00002_api.example.com.txt
│
└─ cookies/
    ├─ request_cookies.json      ← every cookie sent, with origin URL
    └─ response_cookies.json     ← every Set-Cookie, parsed into fields
```

---

## 📊 Export Formats

| Need | Use | Why |
|---|---|---|
| Send to a teammate, capture-as-evidence | **ZIP** | Everything in one archive, including a clickable `index.html` |
| Replay in DevTools, Postman, Charles | **HAR** | Standard HTTP Archive 1.2 with response bodies |
| Pipe through `jq` / Python / AI tooling | **JSON** | A single `{ meta, requests: [...] }` file |
| Spreadsheet, charts, KPIs | **CSV** | One flat row per request |

Full breakdown in the [Export Formats wiki page](https://github.com/Mahdi-hasan-shuvo/network-capture-pro-chrome-extension/wiki/Export-Formats).

---

## 🔧 Use Cases

- 🐛 **Bug reports** — attach the ZIP and let your backend team replay the exact session
- 🔬 **Reverse-engineering APIs** — see every undocumented header, query param and cookie
- 🎯 **API testing** — export to HAR → import to Postman → instant collection
- 🍪 **Auth debugging** — see every Set-Cookie, every blocked cookie, every SameSite issue
- 📊 **Performance analysis** — full timings + byte counts in the CSV
- 🛡️ **Security research** — audit what a site sends and receives (**authorized testing only**)
- 🤖 **Web scraping prep** — capture once, then build your scraper from the saved request files
- 📚 **Teaching** — show students *exactly* what a "login" looks like over the wire

---

## 🧱 Tech Stack

- **Manifest V3** Chrome extension (Chrome 116+)
- **Chrome DevTools Protocol** via `chrome.debugger` (full request/response, including bodies)
- **Offscreen Document API** for blob building (Chrome's MV3 service-worker workaround)
- **`chrome.browsingData`** for per-origin cookie/cache clearing
- **`chrome.storage.local`** for capture persistence across service-worker restarts
- **Pure-JS ZIP writer** — STORE method, no compression, ~100 lines, **zero npm dependencies**
- **Vanilla HTML/CSS/JS** — no React, no build step, no bundler, no transpiler

---

## 📂 Project Structure

```
.
├─ manifest.json          ← MV3 manifest, permissions, entry points
├─ background.js          ← service worker; CDP capture, persistence, downloads
├─ offscreen.html / .js   ← builds ZIP/JSON/HAR/CSV blobs (BLOBS reason)
├─ zip.js                 ← tiny in-house ZIP writer (STORE method)
├─ popup.html / .css / .js   ← compact toolbar UI
├─ panel.html / panel.js  ← full split-view with detail tabs (Overview/Request/Response/Cookies/Body/Raw)
├─ devtools.html / .js    ← registers the "Network Capture" tab inside DevTools
└─ wiki/                  ← full handbook (install, usage, architecture, FAQ)
```

Want the architecture deep-dive? Read [How It Works](https://github.com/Mahdi-hasan-shuvo/network-capture-pro-chrome-extension/wiki/How-It-Works) and the [Developer Guide](https://github.com/Mahdi-hasan-shuvo/network-capture-pro-chrome-extension/wiki/Developer-Guide).

---

## 🔐 Permissions Explained

| Permission | Why it's needed |
|---|---|
| `debugger` | The only way to read full response bodies (DevTools Protocol) |
| `<all_urls>` | Lets the debugger attach to whichever tab you're capturing |
| `storage` | Persists captured requests across service-worker restarts |
| `downloads` | Saves your ZIP / JSON / HAR / CSV files |
| `tabs`, `activeTab` | Knows which tab to attach to and report on |
| `cookies` | Reads cookie metadata for the captured site |
| `browsingData` | Powers per-origin "Clear cookies" / "Clear cache" buttons |
| `offscreen` | Builds blob URLs (service workers can't create blob URLs in MV3) |
| `webNavigation`, `scripting` | Reserved for upcoming auto-attach mode |

**No data ever leaves your machine.** No analytics, no telemetry, no remote hosts, no fonts from CDNs. Audit `background.js` — there are zero `fetch()` calls to anything but the page you're capturing. More detail: [Permissions Explained](https://github.com/Mahdi-hasan-shuvo/network-capture-pro-chrome-extension/wiki/Permissions-Explained).

---

## ❓ FAQ

<details>
<summary><b>Why a yellow bar at the top of the page?</b></summary>

That's Chrome's *required* notice when any extension uses `chrome.debugger`. It cannot be hidden — it's a security feature. The extension stops capturing the moment you close that bar.
</details>

<details>
<summary><b>Can I have DevTools open while capturing?</b></summary>

No — Chrome only allows **one** debugger client per tab at a time. Either capture from a window without DevTools, or use the built-in **DevTools panel** (Network Capture tab) instead of the popup.
</details>

<details>
<summary><b>Will it slow down the page?</b></summary>

The CDP overhead is the same as having DevTools' Network panel open — usually unnoticeable.
</details>

<details>
<summary><b>What about huge response bodies?</b></summary>

Chrome itself will refuse to return very large response bodies through CDP — those are recorded with a `responseBodyError` field instead. Headers, cookies and timings are always captured.
</details>

<details>
<summary><b>Why does my popup say "Stale SW — reload extension!"?</b></summary>

You updated the extension code but didn't reload the service worker. Go to `chrome://extensions` and click the ↻ icon on the Network Capture Pro card.
</details>

<details>
<summary><b>Can I capture multiple tabs at once?</b></summary>

Currently one tab at a time. Multi-tab is on the roadmap.
</details>

More answers in the [full FAQ](https://github.com/Mahdi-hasan-shuvo/network-capture-pro-chrome-extension/wiki/FAQ) and [Troubleshooting](https://github.com/Mahdi-hasan-shuvo/network-capture-pro-chrome-extension/wiki/Troubleshooting).

---

## 🗺️ Roadmap

- [ ] Auto-attach mode (capture on tab open without clicking Start)
- [ ] Multi-tab simultaneous capture
- [ ] cURL / fetch / Python `requests` snippet generator per request
- [ ] Replay request directly from the panel
- [ ] Optional gzip compression in the ZIP writer
- [ ] Saved-capture viewer (drag a ZIP onto the popup → browse it)
- [ ] Custom URL include/exclude allow-list
- [ ] Dark / light theme toggle

Have an idea? [Open a feature request](https://github.com/Mahdi-hasan-shuvo/network-capture-pro-chrome-extension/issues/new/choose).

---

## 🤝 Contributing

PRs are welcome! The codebase is intentionally small (~1,500 LOC, vanilla JS, no build step) so it's easy to dive in.

```bash
git clone https://github.com/Mahdi-hasan-shuvo/network-capture-pro-chrome-extension.git
# load the folder unpacked at chrome://extensions
# edit, then click ↻ on the extension card
```

Read the [Contributing guide](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md) before you start. Open an issue first if you're planning a big feature — happy to sketch the design with you.

---

## 🛡️ Security & Privacy

- ✅ **100% local** — captures stay on your machine; zero telemetry, zero remote hosts.
- ⚠️ **You are recording everything** — including passwords in POST bodies and auth tokens in headers. Treat capture archives like a password-manager export.
- 🔒 Found a vulnerability? Please follow the [Security Policy](SECURITY.md) and report it privately.

Full write-up: [Security & Privacy](https://github.com/Mahdi-hasan-shuvo/network-capture-pro-chrome-extension/wiki/Security-and-Privacy).

---

## ⚖️ License

Released under the **MIT License** — see [LICENSE](LICENSE). Use it, fork it, ship it, sell it. A star ⭐ is appreciated but never required.

---

## 👤 Author & Contact

**Mahdi Hasan Shuvo** — Automation Engineer, ML Engineer & Tool Builder.

| | |
|---|---|
| 🧑‍💻 **GitHub** | [@Mahdi-hasan-shuvo](https://github.com/Mahdi-hasan-shuvo) |
| 📩 **Email** | [shuvobbhh@gmail.com](mailto:shuvobbhh@gmail.com) |
| 💬 **WhatsApp** | [+8801616397082](https://wa.me/8801616397082) |
| 🌐 **Portfolio** | [mahdi-hasan-shuvo.github.io](https://mahdi-hasan-shuvo.github.io/) |

---

<div align="center">

**If this saved you a debugging afternoon, please ⭐ [star the repo](https://github.com/Mahdi-hasan-shuvo/network-capture-pro-chrome-extension) — it really does help others find it.**

Made for developers, security researchers, QA engineers, and anyone who ever wished DevTools had a "save everything" button.

</div>
