---
'@web/test-runner': minor
'@web/test-runner-chrome': minor
'@web/test-runner-cli': minor
'@web/test-runner-commands': minor
'@web/test-runner-core': minor
'@web/test-runner-playwright': minor
'@web/test-runner-puppeteer': minor
'@web/test-runner-selenium': minor
'@web/test-runner-server': minor
'@web/test-runner-browserstack': minor
---

Merged test runner server into core, and made it no longer possible configure a different server.

The test runner relies on the server for many things, merging it into core makes the code more maintainable. The server is composable, you can proxy requests to other servers and we can look into adding more composition APIs later.
