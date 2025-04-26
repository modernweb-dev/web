---
'@web/test-runner': patch
---

summaryReporter: Add missing `cachedLogger.logBufferedMessages()` call in onTestRunFinished

Since the move to buffered logging in https://github.com/modernweb-dev/web/commit/b2c857362d894a9eceb36516af84a800209f187b. A call to `cachedLogger.logBufferedMessages();` was missing. We fix this by adding it. We call `cachedLogger.logBufferedMessages();` after reportTestFileResults but before onTestRunFinished. So the logging we do in summaryReporter. onTestRunFinished gets missed.

Fixes #2936
