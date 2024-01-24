---
'@web/storybook-builder': patch
---

fix: import both globals and globalsNameReferenceMap from @storybook/preview/globals and use the one that is set. This fixes issue https://github.com/modernweb-dev/web/issues/2619
