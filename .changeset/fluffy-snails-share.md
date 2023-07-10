---
'@web/dev-server-core': patch
---

support middleware mode

BREAKING CHANGE

Theoretically it's a breaking change for Plugin API since now `serverStart` hook might not have a param `server`.
It won't impact the codebase immediately since you need to first activate `middlewareMode` to actually break stuff if any plugin depends on `server` existence, but type wise it might break compilation of such plugins right away. We decided to take an easy path and not create a SemVer mess with a minor update as the impact of this is too small and the risk is acceptable.
