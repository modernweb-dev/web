---
'@web/test-runner': patch
'@web/test-runner-browserstack': patch
'@web/test-runner-chrome': patch
'@web/test-runner-cli': patch
'@web/test-runner-core': patch
'@web/test-runner-junit-reporter': patch
'@web/test-runner-playwright': patch
'@web/test-runner-puppeteer': patch
'@web/test-runner-saucelabs': patch
'@web/test-runner-selenium': patch
---

Reworked concurrent scheduling logic

When running tests in multiple browsers, the browsers are no longer all started in parallel. Instead a new `concurrentBrowsers` property controls how many browsers are run concurrently. This helps improve speed and stability.
