# 🍪 Cookies & Cache Tools

The popup's **Target site** row gives you focused, *origin-scoped* cleanup tools so you don't have to nuke your whole browser to test a logout flow.

## What "target site" means
Whichever tab you're capturing — or, if you haven't started a capture yet, the currently active tab. The URL is shown so you can confirm before clicking anything.

## 🔁 Reload / Hard reload
| Button | What it does |
|---|---|
| **Reload** | Same as F5 — uses the cache |
| **Hard reload** | Same as Ctrl+Shift+R — bypasses HTTP cache (re-fetches everything) |

Use **Hard reload** right after a code deploy to make sure you're testing the new bundle.

## 🍪 Clear cookies
Removes cookies for **the target origin only** — including HTTP-only, secure, partitioned and SameSite cookies. Other sites' cookies are untouched.

Powered by:
```js
chrome.browsingData.remove({ origins: [origin] }, { cookies: true })
```

Typical use: **"log me out and prove the logout flow works."**

## 🧹 Clear cache
Removes the HTTP cache and Cache Storage entries for the target origin. Service workers and IndexedDB are *not* touched.

Typical use: **"let me see what the app does on a cold load."**

## ⚠ What's NOT here (by design)
We removed the **"Clear ALL site data"** button so you can't accidentally wipe localStorage / IndexedDB / service workers / WebSQL on a site where it'd be expensive. If you actually want full nuking, use Chrome's built-in `chrome://settings/cookies/detail?site=…` page.

## 💡 Common workflows

### Reproduce a login bug from a clean state
1. Click **Clear cookies**
2. Click **Hard reload**
3. Press **● Start**
4. Log in
5. **■ Stop** → **⬇ ZIP** → attach to bug report

### Re-test a CDN cache fix
1. Click **Clear cache**
2. Click **Reload**
3. Inspect the response in the panel — was `cache-control` honoured?

### Diff before/after a backend deploy
1. Capture session → ⬇ ZIP (rename as `before.zip`)
2. Deploy
3. **Clear cookies** + **Hard reload**
4. Capture session → ⬇ ZIP (rename as `after.zip`)
5. `diff before/all_requests.json after/all_requests.json`
