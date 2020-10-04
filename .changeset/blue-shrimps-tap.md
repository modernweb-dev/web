---
'@web/dev-server': patch
---

Allow user to set open to false, which should result in the browser not opening. Do a falsy check, instead of null && undefined.
