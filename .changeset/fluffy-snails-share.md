---
'@web/dev-server-core': patch
---

support middleware mode

BREAKING CHANGE

Theoretically it's a breaking change for Plugin API since now `serverStart` hook might not have a param `server`.
The breaking change shouldnt impact your codebase immediately since you need to first activate `middlewareMode` to actually break stuff if any plugin depends on the existence of the `server` arg that gets passed to the plugin, but type wise it might break compilation of such plugins right away. Considering that `@web/dev-server` is still on semver 0.x.x, and since the impact of this breaking change should be very minimal, we decided to make the breaking change in this patch version.
