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

Testing Firefox with Puppeteer is still experimental. There is currenly no official way to install both chromium and firefox, but you can set this up for your repository by adding a postinstall step to your package scripts:

`package.json`:

```json
{
  "scripts": {
    "postinstall": "cd node_modules/puppeteer && PUPPETEER_PRODUCT=firefox node install.js"
  }
}
```

Afterwards you can run your tests with an extra firefox flag:

```bash
wtr test/**/*.test.js --node-resolve --puppeteer --browsers firefox
```
