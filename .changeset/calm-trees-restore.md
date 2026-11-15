---
'@web/test-runner-commands': minor
---

Restore `a11ySnapshot` for Chromium in Playwright 1.57 and later. The command reads the accessibility tree through the Chrome DevTools Protocol and returns the same snapshot as `page.accessibility.snapshot()` in Playwright 1.56. Firefox and WebKit still need Playwright 1.56 or earlier.
