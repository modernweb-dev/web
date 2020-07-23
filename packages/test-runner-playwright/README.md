# Web Test Runner Playwright

Browser launcher for `@web/test-runner`. Runs the browser using [playwright](https://www.npmjs.com/package/playwright).

## Usage

If you are using [@web/test-runner](https://github.com/modernweb-dev/web/tree/master/packages/test-runner), you can run playwright using the `--playwright` and `--browsers` flags.

### Customizing launcher options

If you want to customize the playwright launcher options, you can add the browser launcher in the config.

You can find all possible launch options in the [official documentation](https://github.com/microsoft/playwright/blob/master/docs/api.md#browsertypelaunchoptions)

```js
const { playwrightLauncher } = require('@web/test-runner-playwright');

module.exports = {
  browsers: [
    playwrightLauncher({
      // product can be chromium, webkit or firefox
      product: 'chromium',
      launchOptions: {
        executablePath: '/path/to/executable',
        headless: false,
        args: ['--some-flag'],
      },
    }),
  ],
};
```

### Testing multiple browsers

For each browser you can add a separate browser launcher

```js
const { playwrightLauncher } = require('@web/test-runner-playwright');

module.exports = {
  browsers: [
    playwrightLauncher({ product: 'chromium' }),
    playwrightLauncher({ product: 'firefox' }),
    playwrightLauncher({ product: 'webkit' }),
  ],
};
```

### Customizing page creation

You can use a custom function to create the puppeteer `Page`. You can use this for example to set up injecting scripts for environment variables or to expose functions to the browser to control the page.

```js
const { playwrightLauncher } = require('@web/test-runner-playwright');

module.exports = {
  browsers: [
    playwrightLauncher({
      async createPage({ browser, config }) {
        const page = await browser.newPage();

        // expose global variabels in the browser
        page.addInitScript(() => {
          window.__GLOBALS__ = { globalA: 'a', globalB: 'b' };
        });

        // expose a function in the browser, which calls a function on the
        // playwright page in NodeJS
        page.exposeFunction('playwrightScreenshot', () => {
          page.screenshot();
        });

        return page;
      },
    }),
  ],
};
```
