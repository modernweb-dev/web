---
'@web/test-runner-browserstack': minor
---

Migrates `BrowserstackLauncher` to extend from `WebdriverLauncher` instead of `SeleniumLauncher`. This allows the visual regression plugin to work with said launcher.
