---
'@web/test-runner': patch
'@web/test-runner-chrome': patch
'@web/test-runner-playwright': patch
'@web/test-runner-selenium': patch
'@web/test-runner-webdriver': patch
'@web/test-runner-browserstack': patch
'@web/test-runner-puppeteer': patch
'@web/test-runner-saucelabs': patch
---

use about:blank to kill stale browser pages, this makes tests that rely on browser focus work with puppeteer
