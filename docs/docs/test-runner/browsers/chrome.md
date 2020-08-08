---
title: Chrome
eleventyNavigation:
  key: Chrome
  parent: Browsers
  order: 1
---

Runs tests with a locally installed instance of Chrome and controls it using [puppeteer-core](https://www.npmjs.com/package/puppeteer-core). This avoids the post-install step of `puppeteer` or `playwright`, speeding up the installation of projects.

Use [Puppeteer](./puppeteer.md) if you don't want to install Chrome globally, for example in a CI environment.

## Usage

When using `@web/test-runner` regularly, the chrome launcher is installed and used by default.

For other projects you can install the browser launcher by running:

```bash
@web/test-runner-chrome
```

And included in your config:

```js
const { chromeLauncher } = require('@web/test-runner-chrome');

module.exports = {
  browsers: [chromeLauncher()],
};
```

## Customizing launch options

If you want to customize the puppeteer launcher options, you can add the browser launcher in the config.

You can find all possible launch options in the [official documentation](https://github.com/microsoft/puppeteer/blob/master/docs/api.md#browsertypelaunchoptions)

```js
const { chromeLauncher } = require('@web/test-runner-chrome');

module.exports = {
  browsers: [
    chromeLauncher({
      launchOptions: {
        executablePath: '/path/to/executable',
        headless: false,
        args: ['--some-flag'],
      },
    }),
  ],
};
```
