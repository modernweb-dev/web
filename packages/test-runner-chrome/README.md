# Web Test Runner Chrome

Browser launcher for `@web/test-runner`. Looks for a locally installed instance of Chrome, and controls it using [puppeteer-core](https://www.npmjs.com/package/puppeteer-core). This avoids the postinstall step of `puppeteer` or `playwright`, speeding up installation of projects.

If you don't want to install Chrome globally, for example in a CI environment, you can use [@web/test-runner-puppeeteer](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-puppeteer) or [@web/test-runner-playwright](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-playwright)

See [@web/test-runner](https://github.com/modernweb-dev/web/tree/master/packages/test-runner) for a default implementation and CLI for the test runner.

## Usage

If you are using [@web/test-runner](https://github.com/modernweb-dev/web/tree/master/packages/test-runner), the chrome launcher is used by default. You can instantiate it yourself from the config to use on the advanced options.

### Customizing launcher options

If you want to customize the puppeteer launcher options, you can add the browser launcher in the config.

You can find all possible launch options in the [official documentation](https://github.com/microsoft/puppeteer/blob/master/docs/api.md#browsertypelaunchoptions)

```js
const { chromeLauncher } = require('@web/test-runner-chrome');

module.exports = {
  browsers: [
    chromeLauncher({
      launchOptions: {
        headless: false,
        args: ['--some-flag'],
      },
    }),
  ],
};
```

### Customizing page creation

You can use a custom function to create the puppeteer `Page`. You can use this for example to set up injecting scripts for environment variables or to expose functions to the browser to control the page.

```js
const { chromeLauncher } = require('@web/test-runner-chrome');

module.exports = {
  browsers: [
    chromeLauncher({
      async createPage({ browser, config }) {
        const page = await browser.newPage();

        // expose websocket endpoint as an environment variable in the browser
        page.evaluateOnNewDocument(wsEndpoint => {
          window.__ENV__ = { wsEndpoint };
        }, browser.wsEndpoint());

        // expose a function in the browser, which calls a function on the
        // puppeteer page in NodeJS
        page.exposeFunction('puppeteerBringToFront', () => {
          page.bringToFront();
        });

        return page;
      },
    }),
  ],
};
```
