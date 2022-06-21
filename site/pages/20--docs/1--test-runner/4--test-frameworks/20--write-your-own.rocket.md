```js server
/* START - Rocket auto generated - do not touch */
// prettier-ignore
export const sourceRelativeFilePath = '20--docs/1--test-runner/4--test-frameworks/20--write-your-own.rocket.md';
import { html, layout, setupUnifiedPlugins, components } from '../../../recursive.data.js';
export { html, layout, setupUnifiedPlugins, components };
export async function registerCustomElements() {
  // server-only components
  // prettier-ignore
  customElements.define('rocket-social-link', await import('@rocket/components/social-link.js').then(m => m.RocketSocialLink));
  // prettier-ignore
  customElements.define('rocket-header', await import('@rocket/components/header.js').then(m => m.RocketHeader));
  // prettier-ignore
  customElements.define('main-docs', await import('@rocket/components/main-docs.js').then(m => m.MainDocs));
  // hydrate-able components
  // prettier-ignore
  customElements.define('rocket-search', await import('@rocket/search/search.js').then(m => m.RocketSearch));
  // prettier-ignore
  customElements.define('rocket-drawer', await import('@rocket/components/drawer.js').then(m => m.RocketDrawer));
}
/* END - Rocket auto generated - do not touch */
```

# Write Your Own

You can Write Your Own test framework for web test runner by wrapping an existing testing framework or creating a specific one for your project.

This is a minimal example:

```js
import {
  getConfig,
  sessionStarted,
  sessionFinished,
  sessionFailed,
} from '@web/test-runner-core/browser/session.js';

(async () => {
  // notify the test runner that we're alive
  sessionStarted();

  // fetch the config for this test run, this will tell you which file we're testing
  const { testFile, watch, debug, testFrameworkConfig } = await getConfig();
  const failedImports = [];

  // load the test file as an es module
  await import(new URL(testFile, document.baseURI).href).catch(error => {
    failedImports.push({ file: testFile, error: { message: error.message, stack: error.stack } });
  });

  try {
    // run the actual tests, this is what you need to implement
    const testResults = await runTests();

    // notify tests run finished
    sessionFinished({
      passed: failedImports.length === 0 && testResults.passed,
      failedImports,
      testResults,
    });
  } catch (error) {
    // notify an error occurred
    sessionFailed(error);
    return;
  }
})();
```
