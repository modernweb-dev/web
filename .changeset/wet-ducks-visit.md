---
'@web/browser-logs': minor
'@web/config-loader': minor
'@web/dev-server-core': minor
'@web/dev-server-esbuild': minor
'@web/dev-server-legacy': minor
'@web/dev-server-rollup': minor
'@web/test-runner': minor
'@web/test-runner-browserstack': minor
'@web/test-runner-chrome': minor
'@web/test-runner-cli': minor
'@web/test-runner-commands': minor
'@web/test-runner-core': minor
'@web/test-runner-coverage-v8': minor
'@web/test-runner-mocha': minor
'@web/test-runner-playwright': minor
'@web/test-runner-puppeteer': minor
'@web/test-runner-selenium': minor
---

Added native node es module entrypoints. This is a breaking change. Before, native node es module imports would import a CJS module as a default import and require destructuring afterwards:

```js
import playwrightModule from '@web/test-runner-playwright';

const { playwrightLauncher } = playwrightModule;
```

Now, the exports are only available directly as a named export:

```js
import { playwrightLauncher } from '@web/test-runner-playwright';
```
