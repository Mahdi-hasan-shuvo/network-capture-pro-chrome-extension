# Security Policy

Network Capture Pro is a local-only Chrome extension with **no backend, no telemetry, and no network calls** of its own. Even so, it handles sensitive data (cookies, tokens, POST bodies), so we take security seriously.

## Supported versions

| Version | Supported |
|---|---|
| 1.1.x | ✅ |
| < 1.1 | ❌ |

Security fixes land on the latest version. Please upgrade before reporting.

## Reporting a vulnerability

**Please do not open a public issue for security vulnerabilities.**

Instead, report privately through either channel:

1. **GitHub Security Advisories** — open a private report via the repository's **Security → Report a vulnerability** tab (preferred).
2. **Email** — [shuvobbhh@gmail.com](mailto:shuvobbhh@gmail.com) with the subject line `SECURITY: Network Capture Pro`.

Please include:

- A description of the issue and its impact
- Steps to reproduce (or a proof of concept)
- The extension version and your Chrome version
- Any suggested remediation, if you have one

**Response targets:** acknowledgement within 72 hours, and an initial assessment within 7 days. We'll keep you updated as we work on a fix, and credit you in the release notes unless you prefer to stay anonymous.

Please give us a reasonable window to release a fix before any public disclosure.

## Handling captured data safely

Captures contain **everything** the tab sent and received — including passwords in POST bodies and session tokens in headers/cookies. Treat exported archives like a password-manager export:

- Don't email or paste them around in clear text.
- Redact cookies / `Authorization` headers before sharing a capture in a bug report.
- Capture on a throwaway/dummy account when possible.
- Delete archives once you're done with them.

## Responsible & authorized use

Only capture traffic on systems you own or are explicitly authorized to test. The yellow "this tab is being debugged" bar that Chrome displays during capture is a security feature — it makes covert recording impossible, and it must not be circumvented.

See [Security & Privacy](https://github.com/Mahdi-hasan-shuvo/network-capture-pro-chrome-extension/wiki/Security-and-Privacy) for the full write-up.
