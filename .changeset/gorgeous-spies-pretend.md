---
'@web/test-runner': patch
'@web/test-runner-chrome': patch
'@web/test-runner-core': patch
'@web/test-runner-coverage-v8': patch
'@web/test-runner-playwright': patch
'@web/test-runner-puppeteer': patch
---

fetch source map from server when generating code coverage reports. this fixes errors when using build tools that generate source maps on the fly, which don't exist on the file system
