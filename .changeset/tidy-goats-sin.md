---
"@web/browser-logs": patch
"@web/dev-server-hmr": minor
"@web/dev-server": minor
"@web/test-runner-chrome": minor
"@web/test-runner-commands": minor
"@web/test-runner-puppeteer": minor
"@web/test-runner": minor
---

feat/various fixes

- Update puppeteer to `20.0.0`, fixes  #2282
- Use puppeteer's new `page.mouse.reset()` in sendMousePlugin, fixes #2262
- Use `development` export condition by default
