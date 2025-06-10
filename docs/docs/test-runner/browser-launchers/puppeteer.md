# Test Runner >> Browser Launchers >> Puppeteer ||30

Run tests using [Puppeteer](https://www.npmjs.com/package/puppeteer), using a bundled version of Chromium or Firefox (experimental). Use the [Chrome launcher](./chrome.md) to run tests with a globally installed version of Chrome.

## Usage

When using `@web/test-runner` regularly, you can use puppeteer with the `--puppeteer` and `--browsers` flags:

```
# add the package
npm i --save-dev @web/test-runner-puppeteer

# add the flag
wtr test/**/*.test.js --node-resolve --puppeteer
```

## Troubleshooting

Check the official <a href="https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md" target="_blank">troubleshooting page</a> for help with problems during installation.

## Concurrency

You can override the concurrency of this specific browser launcher

```js
import { puppeteerLauncher } from '@web/test-runner-puppeteer';

export default {
  browsers: [puppeteerLauncher({ concurrency: 1 })],
};
```

## Customizing launch options

If you want to customize the puppeteer launcher options, you can add the browser launcher in the config.

You can find all possible launch options in the [official documentation](https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#puppeteerlaunchoptions)

```js
import { puppeteerLauncher } from '@web/test-runner-puppeteer';

export default {
  browsers: [
    puppeteerLauncher({
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
import { puppeteerLauncher } from '@web/test-runner-puppeteer';

export default {
  browsers: [
    puppeteerLauncher({
      createBrowserContext: ({ browser, config }) => browser.defaultBrowserContext(),
      createPage: ({ context, config }) => context.newPage(),
    }),
  ],
};
```

Some examples:

### Emulate mobile browser

```js
import { puppeteerLauncher } from '@web/test-runner-puppeteer';
import { KnownDevices } from 'puppeteer';

export default {
  browsers: [
    puppeteerLauncher({
      async createPage({ context }) {
        const page = await context.newPage();
        page.emulate(KnownDevices['Pixel 2']);
        return page;
      },
    }),
  ],
};
```

### Grant browser permissions

```js
import { puppeteerLauncher } from '@web/test-runner-puppeteer';

export default {
  browsers: [
    puppeteerLauncher({
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

## Testing Firefox

Testing Firefox with Puppeteer is still experimental. There is currently no official way to install both chromium and firefox, but you can set this up for your repository by adding a post-install step to your package scripts:

`package.json`:

```json
{
  "scripts": {
    "postinstall": "cd node_modules/puppeteer && PUPPETEER_BROWSER=firefox node install.js"
  }
}
```

Afterward, you can run your tests with an extra firefox flag:

```
wtr test/**/*.test.js --node-resolve --puppeteer --browsers firefox
```
