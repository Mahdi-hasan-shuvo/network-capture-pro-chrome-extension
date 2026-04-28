# ▶️ Quick Start — your first capture in 60 seconds

Already installed? Great. Let's record your first session.

## 1. Open the website you want to inspect
Any tab. Login pages, SPAs, APIs, dashboards — whatever.

## 2. Click the 🌐 Network Capture Pro icon
The popup opens with three sections: stats, controls, target site.

## 3. Press **● Start**
You'll see:
- Chrome adds a **yellow notice bar** at the top of the page ("This tab is being debugged…") — leave it alone, it's required
- The popup status changes to **Recording**
- The toolbar icon shows a red **REC** badge
- The request counter starts climbing

## 4. Use the site like a normal user
- Click links
- Submit forms
- Open menus
- Trigger AJAX calls
- Submit logins (passwords are captured in the POST body — see [[Security-and-Privacy]])

## 5. Press **■ Stop**
The recording freezes. You can resume capturing on the same tab anytime.

## 6. Press **⬇ ZIP**
A timestamped archive lands in your Downloads folder, e.g.

```
network_capture_2026-04-28T14-02-33-512Z.zip
```

## 7. Read your capture

Unzip the archive and open `index.html` in your browser — you'll get a clickable, sortable list of every request. From there:

- Click any request → opens its full JSON detail
- Open `bodies/00007_api.example.com.json` → the raw JSON the server sent
- Open `capture.har` in **Chrome DevTools → Network → ⤴ Import HAR** to replay it
- Open `capture.csv` in Excel for a flat overview

🎉 That's it. You captured every byte of traffic on that tab.

---

## Bonus tips

| Trick | How |
|---|---|
| **Filter while recording** | Type into the filter box — list updates live |
| **Pause without losing the session** | Press **‖ Pause** instead of Stop, then **▶ Resume** |
| **Capture across page reloads** | Just leave it running — refresh, navigate, no problem |
| **Get a bigger view** | Click *Open full panel ↗* in the popup footer |
| **Capture from inside DevTools** | Open DevTools → switch to the **Network Capture** tab |
| **Wipe site auth and try again** | **Clear cookies** + **Hard reload** in the Target site row |
