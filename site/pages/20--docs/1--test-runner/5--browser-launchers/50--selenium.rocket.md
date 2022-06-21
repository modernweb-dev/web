```js server
/* START - Rocket auto generated - do not touch */
// prettier-ignore
export const sourceRelativeFilePath = '20--docs/1--test-runner/5--browser-launchers/50--selenium.rocket.md';
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

# Selenium

Run tests using [selenium-webdriver](https://www.npmjs.com/package/selenium-webdriver).

For testing on modern browsers, we don't recommend using Selenium, as it does not support running tests in parallel and there are better options available.

## Usage

1. Make sure you have a selenium server running, either locally or remote.

2. Add the selenium launcher to your test runner config, specifying the browser builder with the necessary options:

```js
import { seleniumLauncher } from '@web/test-runner-selenium';
import webdriver from 'selenium-webdriver';

module.exports = {
  browsers: seleniumLauncher({
    driverBuilder: new webdriver.Builder()
      .forBrowser('chrome')
      .setChromeOptions(new ChromeOptions().headless())
      .usingServer('http://localhost:4444/wd/hub'),
  }),
};
```
