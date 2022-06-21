```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '20--docs/1--test-runner/9--testing-in-a-ci.rocket.md';
import { html, layout, setupUnifiedPlugins, components } from '../../recursive.data.js';
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

# Testing in a CI

It's possible to use the test runner in a CI, but because it runs tests on a real browser you need to ensure the CI environments can support it.

The test runner uses `@web/test-runner-chrome` by default which looks for a locally installed Chrome. For your CI you can look for an image which installs Chrome to run your tests.

## Puppeteer

You can also use `@web/test-runner-puppeteer` which downloads it's own compatible version of Chromium. This is more convenient, and can be more stable as well.

Puppeteer has a [dedicated page](https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md) on troubleshooting in general, and contains section on using puppeteer in a CI environment.

## Playwright

If you want to use `@web/test-runner-playwright` in a CI environment you need to ensure the necessary native libraries are installed.

For the modern web repositories, we run our tests using Github Actions with the [Github Actions plugin](https://github.com/microsoft/playwright-github-action).

Check the [official documentation](https://playwright.dev/#version=master&path=docs%2Fci.md&q=) for more information on different CI environments.
