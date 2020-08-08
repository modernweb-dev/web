---
title: Browsers
eleventyNavigation:
  key: Browsers
  parent: Test Runner
  order: 5
---

Browser launchers boot up and control a browser instance to run your tests. By default, tests are run with the locally installed instance of Chrome, controlled via `puppeteer-core`.

## CLI flags

For convenience you can configure a few other browser launchers using CLI flags

### Puppeteer

You can run tests with puppeteer, which will download its a local instance of Chromium instead of relying on a globally installed version of Chrome.

```bash
# add the package
npm i -D @web/test-runner-puppeteer

# add the flag
wtr test/**/*.test.js --node-resolve --puppeteer
```

Puppeteer has experimental support for firefox. It requires an extra installation step, check [@web/test-runner-puppeteer](./browser-launchers/puppeteer.md) how to set it up.

### Playwright

You can run tests with playwright, which like puppeteer downloads it's own browsers. Playwright allows testing on chromium, firefox, and WebKit.

```bash
# add the package
npm i -D @web/test-runner-playwright

# add the flag
wtr test/**/*.test.js --node-resolve --playwright --browsers chromium firefox webkit
```

## Configuring browser launchers

You configure which browser launchers to run from your config file. You can use this for confusing browser launchers other than the ones available in the CLI, and to configure advanced options.

```js
// import the browser launcher you want to use, chromeLauncher is the default
const { chromeLauncher } = require('@web/test-runner');
// const { playwrightLauncher } = require('@web/test-runner-playwright');
// const { puppeteerLauncher } = require('@web/test-runner-puppeteer');
// const { seleniumLauncher } = require('@web/test-runner-selenium');
// const { browserstackLauncher } = require('@web/test-runner-browserstack');

module.exports = {
  browsers: [chromeLauncher({ launchOptions: { args: ['--no-sandbox'] } })],
};
```
