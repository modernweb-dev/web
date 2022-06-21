```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '20--docs/1--test-runner/4--test-frameworks/index.rocket.md';
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

# Test Frameworks

Test frameworks load and run your tests in the browser, and provide the framework needed to define your tests.

You can use any test framework with web test runner, but it does require a small wrapper around the framework to communicate the test results from the browser back to the test runner. Right now we only have a test framework implementation for Mocha, which is used by default in the test runner.
