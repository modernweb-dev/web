---
'@web/test-runner-mocha': minor
---

Update the bundled `mocha` browser build from 10.8.2 to 12.0.3, so `dist/standalone.js` and `dist/autorun.js` no longer inline jsdiff 5.2.0. That copy was invisible to `npm audit` because mocha is only a devDependency and its bundled diff is not declared, and it carried the `parsePatch`/`applyPatch` denial of service from CVE-2026-24001. Mocha only ever calls `createPatch` to render assertion diffs, so the behavior is unchanged.

This is a minor bump rather than a patch because the mocha version inside the browser bundle changes by two major releases, and test suites run against whichever mocha this package ships.
