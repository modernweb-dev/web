---
title: Test Runner Playwright
eleventyNavigation:
  key: Playwright
  parent: Browser Launchers
---

Browser launcher for `@web/test-runner`. Runs the browser using [playwright](https://www.npmjs.com/package/playwright).

## Usage

If you are using [@web/test-runner](https://github.com/modernweb-dev/web/tree/master/packages/test-runner), you can run playwright using the `--playwright` and `--browsers` flags.

### Customizing launcher options

If you want to customize the playwright launcher options, you can add the browser launcher in the config.

You can find all possible launch options in the [official documentation](https://github.com/microsoft/playwright/blob/master/docs/api.md#browsertypelaunchoptions)

```js
const { playwrightLauncher } = require('@web/test-runner-playwright');

module.exports = {
  browwsers: [
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
  browwsers: [
    playwrightLauncher({ product: 'chromium' }),
    playwrightLauncher({ product: 'firefox' }),
    playwrightLauncher({ product: 'webkit' }),
  ],
};
```
