```js server
/* START - Rocket auto generated - do not touch */
// prettier-ignore
export const sourceRelativeFilePath = '20--docs/1--test-runner/5--browser-launchers/20--chrome.rocket.md';
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

# Chrome

Runs tests with a locally installed instance of Chrome and controls it using [puppeteer-core](https://www.npmjs.com/package/puppeteer-core). This avoids the post-install step of `puppeteer` or `playwright`, speeding up the installation of projects.

Use [Puppeteer](./puppeteer.md) if you don't want to install Chrome globally, for example in a CI environment.

## Usage

When using `@web/test-runner` regularly, the chrome launcher is installed and used by default.

For other projects you can install the browser launcher by running:

```
@web/test-runner-chrome
```

And included in your config:

```js
import { chromeLauncher } from '@web/test-runner-chrome';

export default {
  browsers: [chromeLauncher()],
};
```

## Concurrency

You can override the concurrency of this specific browser launcher

```js
import { chromeLauncher } from '@web/test-runner-chrome';

export default {
  browsers: [chromeLauncher({ concurrency: 1 })],
};
```

## Customizing launch options

If you want to customize the puppeteer launcher options, you can add the browser launcher in the config.

You can find all possible launch options in the [official documentation](https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#puppeteerlaunchoptions)

```js
import { chromeLauncher } from '@web/test-runner-chrome';

export default {
  browsers: [
    chromeLauncher({
      launchOptions: {
        executablePath: '/path/to/executable',
        headless: false,
        devtools: true,
        args: ['--some-flag'],
      },
    }),
  ],
};
```

## Customizing browser context and page

You can customize the way the browser context or puppeteer page is created. This allows configuring the test environment. Check the [official documentation](https://github.com/puppeteer/puppeteer/blob/v5.5.0/docs/api.md) for all API options.

```js
import { chromeLauncher } from '@web/test-runner-chrome';

export default {
  browsers: [
    chromeLauncher({
      createBrowserContext: ({ browser, config }) => browser.defaultBrowserContext(),
      createPage: ({ context, config }) => context.newPage(),
    }),
  ],
};
```

Some examples:

### Emulate mobile browser

```js
import { chromeLauncher, devices } from '@web/test-runner-chrome';

export default {
  browsers: [
    chromeLauncher({
      async createPage({ context }) {
        const page = await context.newPage();
        page.emulate(devices['Pixel 2']);
        return page;
      },
    }),
  ],
};
```

### Grant browser permissions

```js
import { chromeLauncher } from '@web/test-runner-chrome';

export default {
  browsers: [
    chromeLauncher({
      async createBrowserContext({ browser }) {
        // use default browser context
        const context = browser.defaultBrowserContext();

        // or create a new browser context if necessary
        // const context = await browser.createIncognitoBrowserContext()

        // grant the permissions
        await context.overridePermissions('http://localhost:8000/', ['geolocation']);
        return context;
      },
    }),
  ],
};
```
