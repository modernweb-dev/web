---
'@web/test-runner-chrome': minor
'@web/test-runner-cli': minor
'@web/test-runner-commands': minor
'@web/test-runner-core': minor
'@web/test-runner-playwright': minor
'@web/test-runner-selenium': minor
'@web/test-runner': minor
'@web/test-runner-browserstack': minor
'@web/test-runner-puppeteer': minor
'@web/test-runner-saucelabs': minor
---

replaced HTTP with websocket for server-browser communication

this improves test speed, especially when a test file makes a lot of concurrent requests
it lets us us catch more errors during test execution, and makes us catch them faster
