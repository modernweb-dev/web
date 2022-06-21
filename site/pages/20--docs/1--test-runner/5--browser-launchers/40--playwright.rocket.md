```js server
/* START - Rocket auto generated - do not touch */
// prettier-ignore
export const sourceRelativeFilePath = '20--docs/1--test-runner/5--browser-launchers/40--playwright.rocket.md';
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

# Playwright

Run tests using [Playwright](https://www.npmjs.com/package/playwright), using a bundled versions of Chromium, Firefox, and/or Webkit.

## Usage

When using `@web/test-runner` regularly, you can use Playwright with the `--playwright` and `--browsers` flags:

```
# add the package
npm i --save-dev @web/test-runner-playwright

# add the flag
wtr test/**/*.test.js --node-resolve --playwright --browsers chromium firefox webkit
```

## Testing multiple browsers

For each browser, you can add a separate browser launcher

```js
import { playwrightLauncher } from '@web/test-runner-playwright';

export default {
  browsers: [
    playwrightLauncher({ product: 'chromium' }),
    playwrightLauncher({ product: 'firefox' }),
    playwrightLauncher({ product: 'webkit' }),
  ],
};
```

## Concurrency

You can override the concurrency of this specific browser launcher

```js
import { playwrightLauncher } from '@web/test-runner-playwright';

export default {
  browsers: [playwrightLauncher({ product: 'firefox', concurrency: 1 })],
};
```

## Customizing launch options

If you want to customize the playwright launcher options, you can add the browser launcher in the config.

You can find all possible launch options in the [official documentation](https://playwright.dev/docs/api/class-browsertype#browsertypelaunchoptions).

```js
import { playwrightLauncher } from '@web/test-runner-playwright';

export default {
  browsers: [
    playwrightLauncher({
      launchOptions: {
        headless: false,
        devtools: true,
        args: ['--some-flag'],
      },
    }),
  ],
};
```

## Customizing browser context and page

You can customize the way the browser context or playwright page is created. This allows configuring the test environment. Check the [official documentation](https://playwright.dev/docs/api/class-playwright) for all API options.

```js
import { playwrightLauncher } from '@web/test-runner-playwright';

export default {
  browsers: [
    playwrightLauncher({
      createBrowserContext: ({ browser, config }) => browser.newContext(),
      createPage: ({ context, config }) => context.newPage(),
    }),
  ],
};
```

Some examples:

### Emulate touch

```js
import { playwrightLauncher } from '@web/test-runner-playwright';

export default {
  browsers: [
    playwrightLauncher({
      product: 'webkit',
      createBrowserContext({ browser }) {
        return browser.newContext({ userAgent: 'custom user agent', hasTouch: true });
      },
    }),
  ],
};
```

### Emulate mobile browser

```js
import { playwrightLauncher, devices } from '@web/test-runner-playwright';

export default {
  browsers: [
    playwrightLauncher({
      product: 'webkit',
      createBrowserContext({ browser }) {
        return browser.newContext({ ...devices['iPhone X'] });
      },
    }),
  ],
};
```

### Configuring timezone

```js
import { playwrightLauncher } from '@web/test-runner-playwright';

export default {
  browsers: [
    playwrightLauncher({
      product: 'chromium',
      createBrowserContext({ browser }) {
        return browser.newContext({ timezoneId: 'Asia/Singapore' });
      },
    }),
  ],
};
```

### Using with Github Actions

When used with Github Actions, the above will not work because Playwright requires
specific packages not available in the Github Actions container. Rather than installing
the required packages manually, the easiest work around is to use
the official Playwright Action provided by Microsoft.

https://github.com/marketplace/actions/run-playwright-tests

This action will allow you to run the Playwright launcher provided by web-test-runner.

### CI / Docker

For other CI Environment setups as well as using Playwright with Docker, check out the official docs provided by Playwright.

https://playwright.dev/docs/ci
