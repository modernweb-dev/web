```js server
/* START - Rocket auto generated - do not touch */
// prettier-ignore
export const sourceRelativeFilePath = '20--docs/1--test-runner/5--browser-launchers/80--webdriver.rocket.md';
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

# Webdriver

Run tests using [WebdriverIO](https://webdriver.io).

## Usage

1. Make sure you have a selenium server running, either locally or remote.

2. Add the Webdriver launcher to your test runner config and specify relevant [options](https://webdriver.io/docs/options.html):

```js
import { webdriverLauncher } from '@web/test-runner-webdriver';

module.exports = {
  browsers: [
    webdriverLauncher({
      automationProtocol: 'webdriver',
      path: '/wd/hub/',
      capabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
          args: ['--no-sandbox', '--headless']
        }
      }
    })
    webdriverLauncher({
      automationProtocol: 'webdriver',
      path: '/wd/hub/',
      capabilities: {
        browserName: 'firefox',
        'moz:firefoxOptions': {
          args: ['-headless']
        }
      }
    })
  ]
};
```
