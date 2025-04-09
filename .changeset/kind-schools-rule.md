---
'@web/test-runner-chrome': patch
---

This changeset removes the Puppeteer/Chrome focus browser patches that shouldn't
be needed anymore, and can cause instability.

The patches were added quite a while ago, and the upstream issues should
be resolved in Chromium. See: https://issues.chromium.org/issues/40272146.

Also see:
https://github.com/puppeteer/puppeteer/issues/10350#issuecomment-1586858101.

The patches are currently also resulting some instability of web test
runner. That is because the patch calls an exposed function from inside
the browser, while navigation later on during `stopSession` can happen;
breaking the handle for retrieving function call arguments passed to the
exposed function.

Puppeteer team found this issue and also landed a fix to improve the
failure mode here. See:
https://github.com/puppeteer/puppeteer/pull/13759
