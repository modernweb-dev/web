```js server
/* START - Rocket auto generated - do not touch */
// prettier-ignore
export const sourceRelativeFilePath = '20--docs/1--test-runner/5--browser-launchers/10--overview.rocket.md';
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

# Overview

For convenience you can configure a few other browser launchers using CLI flags

## Puppeteer

You can run tests with puppeteer, which will download its a local instance of Chromium instead of relying on a globally installed version of Chrome.

```
# add the package
npm i --save-dev @web/test-runner-puppeteer

# add the flag
wtr test/**/*.test.js --node-resolve --puppeteer
```

Puppeteer has experimental support for firefox. It requires an extra installation step, check [@web/test-runner-puppeteer](./puppeteer.md) how to set it up.

## Playwright

You can run tests with playwright, which like puppeteer downloads it's own browsers. Playwright allows testing on chromium, firefox, and WebKit.

```
# add the package
npm i --save-dev @web/test-runner-playwright

# add the flag
wtr test/**/*.test.js --node-resolve --playwright --browsers chromium firefox webkit
```

## Configuring browser launchers

You configure which browser launchers to run from your config file. You can use this for configuring browser launchers other than the ones available in the CLI, and to configure advanced options.

Note that when configuring browser launchers in the config, you should no longer use the `--puppeteer` or `--playwright` flags.

```js
// import the browser launcher you want to use, chromeLauncher is the default
import { chromeLauncher } from '@web/test-runner';
// import { playwrightLauncher } from '@web/test-runner-playwright';
// import { puppeteerLauncher } from '@web/test-runner-puppeteer';
// import { seleniumLauncher } from '@web/test-runner-selenium';
// import { browserstackLauncher } from '@web/test-runner-browserstack';

export default {
  browsers: [chromeLauncher({ launchOptions: { args: ['--no-sandbox'] } })],
};
```
