# 🔍 Using the UI

The extension ships with **three** different surfaces. They share the same backend — pick whichever fits the moment.

## 1. Toolbar popup
Compact, always-on-top, perfect for quick captures.

| Section | What it does |
|---|---|
| **Status bar** | Shows `Idle / Recording / Paused` and the version badge |
| **Stats** | Live request count, elapsed timer, total bytes, start time |
| **Controls** | `● Start` · `‖ Pause` · `■ Stop` · `Clear` |
| **Download** | `⬇ ZIP` · `⬇ JSON` · `⬇ HAR` · `⬇ CSV` |
| **Target site** | URL + buttons: `Open / focus tab` · `Reload` · `Hard reload` · `Clear cookies` · `Clear cache` |
| **Filter bar** | Text filter + type dropdown + method dropdown |
| **Live list** | Latest 200 requests; click any row to expand its JSON |

## 2. Full panel (`Open full panel ↗`)
Splits the screen 50/50 — left list, right detail. Detail has tabs:

- **Overview** — URL, method, status, MIME, remote IP, timings, bytes
- **Request** — headers, query params, post body (raw + parsed)
- **Response** — headers, timing, security details
- **Cookies** — request cookies, `Set-Cookie` (parsed), blocked cookies
- **Body** — raw response body (or first 80 KB if huge)
- **Raw** — the entire entry as JSON, copy-pasteable

This is the best surface for digging deep into a single request.

## 3. DevTools panel
Open Chrome DevTools (F12) → switch to the **Network Capture** tab. Same controls, but lives next to the Elements / Console / Network tabs you already use.

⚠️ **Note** — only one debugger client per tab. If you open DevTools' Network panel, *that* takes the slot. Capture from a separate window, or use the popup/full-panel UIs instead.

---

## Filtering rules
The filter input matches against `method + url + status + mime` (case-insensitive substring). Combined with the type and method dropdowns. Examples:

| Filter text | Matches |
|---|---|
| `login` | any URL containing "login" |
| `400` | any status starting with 400-something |
| `json` | any response with `application/json` MIME |
| `api.example.com` | only that host |
| `POST` (in dropdown) | only POST requests |

## Status colour coding
- 🟢 `2xx` — green
- 🟡 `3xx` — yellow
- 🔴 `4xx` / `5xx` / failed — red
- ⚪ `…` — pending (response not received yet)
