# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

Nothing yet. See the [Roadmap](README.md#-roadmap) for what's planned.

## [1.1.0]

The current release. Core feature set:

### Added
- Full request/response capture via the Chrome DevTools Protocol (`chrome.debugger`),
  including request/response headers, cookies, query params, POST bodies
  (raw + parsed JSON/form), and response bodies (text and base64 binary).
- WebSocket frame capture.
- One-click export to **ZIP**, **JSON**, **HAR 1.2**, and **CSV**.
- ZIP archive with per-request JSON files, raw response bodies, post-data,
  parsed request/response cookies, a CSV + HAR, and a clickable `index.html`.
- Three UIs: toolbar popup, full-page panel, and an embedded DevTools tab.
- Live capture controls: Start, Pause, Resume, Stop, Clear — with request
  counter, byte counter, elapsed timer, and a recording badge.
- Smart filters by URL, method, status, MIME, and resource type.
- Per-origin **Clear cookies** and **Clear cache** tools via `chrome.browsingData`.
- Tab tools: open/focus the captured tab, reload, and hard reload.
- Capture persistence across service-worker restarts via `chrome.storage.local`.

> Version history before 1.1.0 was not tracked in a changelog.

[Unreleased]: https://github.com/Mahdi-hasan-shuvo/network-capture-pro-chrome-extension/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/Mahdi-hasan-shuvo/network-capture-pro-chrome-extension/releases/tag/v1.1.0
