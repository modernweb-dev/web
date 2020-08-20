---
title: Chrome
eleventyNavigation:
  key: Browsers > Overview
  title: Overview
  parent: Browsers
  order: 10
---

For convenience you can configure a few other browser launchers using CLI flags

## Puppeteer

You can run tests with puppeteer, which will download its a local instance of Chromium instead of relying on a globally installed version of Chrome.

```
# add the package
npm i -D @web/test-runner-puppeteer

# add the flag
wtr test/**/*.test.js --node-resolve --puppeteer
```

Puppeteer has experimental support for firefox. It requires an extra installation step, check [@web/test-runner-puppeteer](./browser-launchers/puppeteer.md) how to set it up.

## Playwright

You can run tests with playwright, which like puppeteer downloads it's own browsers. Playwright allows testing on chromium, firefox, and WebKit.

```
# add the package
npm i -D @web/test-runner-playwright

# add the flag
wtr test/**/*.test.js --node-resolve --playwright --browsers chromium firefox webkit
```

## Configuring browser launchers

You configure which browser launchers to run from your config file. You can use this for confusing browser launchers other than the ones available in the CLI, and to configure advanced options.

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
