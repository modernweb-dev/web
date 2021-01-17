---
'@web/test-runner-core': patch
'@web/test-runner': patch
---

fix regression introduced in filterBrowserLogs function that flipped the return value. returning true now properly includes the logs
