# 🩹 Troubleshooting

Most issues fall into one of five buckets. Find yours below.

---

## 🟥 1. "unknown message type X" / popup says **Stale SW**

**Cause:** Chrome reloaded your popup HTML but kept the old service worker.

**Fix:**
1. Open `chrome://extensions`
2. Click ↻ on the **Network Capture Pro** card
3. Reopen the popup — the version badge should now match `manifest.json`

If it still says stale, restart Chrome.

---

## 🟥 2. "Cannot read properties of undefined (reading 'download')"

**Cause:** Service worker is stale (same as above) and your popup is talking to v1.0 background code.

**Fix:** Reload the extension at `chrome://extensions` → ↻.

---

## 🟥 3. Download fails with no error

**Cause:** Usually one of:
- Offscreen document didn't get created (try restarting Chrome)
- Blob URL was revoked too early (very rare; reload extension)
- Chrome's downloads dir is read-only (check `chrome://settings/downloads`)

**Fix:**
1. Open `chrome://extensions` → click "Inspect views: offscreen.html"
2. Press an export button
3. Check the offscreen page's console — the error will be there

---

## 🟥 4. "DevTools is already attached to this tab"

**Cause:** Chrome only allows **one** debugger client per tab. You have DevTools open on the same tab.

**Fix:**
- Close DevTools on the captured tab, OR
- Open the **Network Capture** tab inside DevTools and use that UI instead, OR
- Capture from a separate window without DevTools open

---

## 🟥 5. Yellow "is being debugged" bar disappears mid-capture

**Cause:** You (or another extension, or DevTools) detached the debugger.

**Symptoms:** Status flips to **Idle**, request counter stops climbing.

**Fix:** Press **● Start** again. Already-captured data is preserved.

---

## 🟧 6. Captured a request but no response body

**Cause:** Either:
- Chrome refused to return the body via `Network.getResponseBody` (usually for very large or streamed responses)
- The request was served from disk cache (`fromDiskCache: true`) — bodies aren't in cache for CDP
- The request failed before the body arrived

**Diagnosis:** Open the request's detail JSON, look for:
- `responseBodyError` — Chrome's error message
- `fromDiskCache: true` — disk-cached, no body
- `failed: true` + `errorText` — request failed

**Workaround:** **Clear cache** + **Hard reload** to force a non-cached re-fetch.

---

## 🟧 7. "browsingData permission missing"

**Cause:** You upgraded the extension but Chrome didn't apply the new permissions yet.

**Fix:** `chrome://extensions` → ↻ on the card → if prompted, **Accept** the new permissions.

---

## 🟧 8. Capture is laggy or the page feels slow

**Cause:** Capturing megabyte-sized response bodies one-after-another can stress the SW.

**Fix:**
- Press **‖ Pause** during heavy bursts
- Use the type filter to focus on `XHR` / `Fetch` if you don't need static assets
- Press **Clear** between captures so the in-memory list stays small

---

## 🟧 9. ZIP downloads but won't open

**Cause:** Almost always a corrupted blob from a Chrome bug or a disk-write error.

**Fix:** Re-download. Check `chrome://downloads` for any "interrupted" entries. Confirm enough disk space.

If it persists, please open an issue with:
- Chrome version (`chrome://version`)
- OS
- A screenshot of the offscreen console (`chrome://extensions` → Inspect views: offscreen.html)

---

## 🟦 Still stuck?

Open an issue with:

1. Chrome version
2. OS
3. Steps to reproduce
4. Service worker console output (`chrome://extensions` → Inspect views: service worker)
5. Offscreen console output (`chrome://extensions` → Inspect views: offscreen.html)

We'll get you sorted.
