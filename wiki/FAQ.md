# ❓ Frequently Asked Questions

## General

<details>
<summary><b>Is this free? Can I use it commercially?</b></summary>

Yes. MIT licensed — use it personally, on the job, in client engagements, in a paid product, anywhere. No attribution required (but ⭐ helps the project).
</details>

<details>
<summary><b>Does it work on Edge / Brave / Vivaldi / Opera / Arc?</b></summary>

It should — the codebase only uses standard MV3 + CDP APIs. If you try one and something breaks, please open an issue.
</details>

<details>
<summary><b>Will there be a Firefox version?</b></summary>

Firefox doesn't currently expose enough of CDP to capture full response bodies the way Chrome does. If that changes, yes.
</details>

## Capturing

<details>
<summary><b>Why does Chrome show a yellow notice bar?</b></summary>

Because we use `chrome.debugger`, which gives us the same firepower as DevTools itself — including the ability to read response bodies. Chrome's security policy mandates the visible warning whenever any extension uses this API. It cannot be hidden, and we wouldn't want to.
</details>

<details>
<summary><b>Can I have DevTools open while capturing?</b></summary>

No — Chrome enforces "one debugger client per tab". Either capture from a window without DevTools, or use the embedded **Network Capture** tab *inside* DevTools instead of the popup.
</details>

<details>
<summary><b>Can I capture multiple tabs at once?</b></summary>

Currently one tab at a time. Multi-tab capture is on the [[Roadmap]].
</details>

<details>
<summary><b>Will it slow down the page?</b></summary>

CDP overhead is the same as having DevTools' Network panel open — usually unnoticeable. If you're capturing a heavy SPA with thousands of requests, you may want to filter by type to keep the live list snappy.
</details>

<details>
<summary><b>Does it survive page navigations / reloads?</b></summary>

Yes. The debugger session stays attached to the *tab*, not the page, so you can navigate freely and the counter keeps going.
</details>

## Exports

<details>
<summary><b>What's the maximum capture size?</b></summary>

Practically: a few hundred MB of total traffic before `chrome.storage.local` starts to feel cramped. The ZIP writer itself can produce archives up to a few GB.
</details>

<details>
<summary><b>Why are some response bodies missing?</b></summary>

Three reasons:
1. **Disk cache hits** — Chrome serves from cache; the body isn't streamed through CDP. Use *Clear cache* + *Hard reload* to force re-fetches.
2. **Streaming / large responses** — Chrome's CDP refuses to return very large bodies. The entry will have a `responseBodyError` field instead.
3. **Failed requests** — if the request errored before the body arrived, there's nothing to capture.
</details>

<details>
<summary><b>Are passwords captured?</b></summary>

Yes — anything you submit to a server is captured, including passwords in form bodies and tokens in headers. Treat exports as sensitive. See [[Security-and-Privacy]].
</details>

<details>
<summary><b>Can I import a ZIP back into the extension to view it later?</b></summary>

Not yet — drag-to-import is on the [[Roadmap]]. For now, unzip and open `index.html` in any browser, or load `capture.har` into Chrome DevTools.
</details>

<details>
<summary><b>Can I generate cURL / fetch / Python snippets from a request?</b></summary>

On the [[Roadmap]]. Until then, every request's full JSON is in `requests/<NNNNN>_<host>_<METHOD>.json` — easy to convert with a one-liner.
</details>

## UI

<details>
<summary><b>Why does the popup say "Stale SW — reload extension"?</b></summary>

You updated the extension code without reloading the service worker. Go to `chrome://extensions` → click ↻ on the **Network Capture Pro** card.
</details>

<details>
<summary><b>How do I find the full panel?</b></summary>

Click the **Open full panel ↗** link in the popup footer, or open Chrome DevTools and switch to the **Network Capture** tab.
</details>

<details>
<summary><b>Is there a dark/light theme switch?</b></summary>

Currently dark only. Light theme + auto-match-system is on the [[Roadmap]].
</details>

## Privacy

<details>
<summary><b>Does it phone home?</b></summary>

No. Zero outbound network calls. Read [`background.js`](../background.js) yourself — there are no `fetch`, `XMLHttpRequest`, `WebSocket`, or `sendBeacon` calls to any remote host.
</details>

<details>
<summary><b>Is my data uploaded anywhere?</b></summary>

No. Captures live in `chrome.storage.local` and your `Downloads` folder — both 100% on your device.
</details>

<details>
<summary><b>Does it work offline?</b></summary>

Yes. The extension itself runs offline. (Naturally, you'll only have something to capture if the page you're on talks to a server.)
</details>

---

Have a question that isn't here? Open a [Discussion](https://github.com/<your-username>/network-capture-pro-chrome-extension/discussions/categories/q-a) — happy to add it.
