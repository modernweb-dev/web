---
'@web/test-runner-core': patch
---

Move @types devDependencies to dependencies since user's TSC will also lint libs, therefore these types have to be installed for them.
