---
'@web/dev-server-hmr': patch
---

Prevent dependencies from being cleared eagerly on serve, this prevented from updates to bubble to parents that do accept updates.
