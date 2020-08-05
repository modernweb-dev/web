---
title: Test Runner Puppeteer
eleventyNavigation:
  key: Puppeteer
  parent: Browser Launchers
---

Browser launcher for `@web/test-runner`. Runs the browser using [puppeteer](https://www.npmjs.com/package/puppeteer).

## Usage

If you are using [@web/test-runner](https://github.com/modernweb-dev/web/tree/master/packages/test-runner), you can run puppeteer using the `--puppeteer` and `--browsers` flags.

### Customizing launcher options

If you want to customize the puppeteer launcher options, you can add the browser launcher in the config.

You can find all possible launch options in the [official documentation](https://github.com/microsoft/puppeteer/blob/master/docs/api.md#browsertypelaunchoptions)

```js
const { puppeteerLauncher } = require('@web/test-runner-puppeteer');

module.exports = {
  browwsers: [
    puppeteerLauncher({
      launchOptions: {
        executablePath: '/path/to/executable',
        headless: false,
        args: ['--some-flag'],
      },
    }),
  ],
};
```

### Testing Firefox

Testing Firefox in Puppeteer is still experimental. Currently you cannot run puppeteer with both Chromium and Firefox in a repository. Check the [official docs](https://www.npmjs.com/package/puppeteer) to learn more about how to set install Firefox instead of Chromium.

To run puppeteer with firefox, you can set the `product` option or set the `PUPPETEER_PRODUCT` environment variable.

```js
const { puppeteerLauncher } = require('@web/test-runner-puppeteer');

module.exports = {
  browwsers: [
    puppeteerLauncher({
      launchOptions: {
        product: 'firefox',
        executablePath: '/path/to/executable',
        headless: false,
        args: ['--some-flag'],
      },
    }),
  ],
};
```
