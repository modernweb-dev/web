---
title: Test Runner Selenium
eleventyNavigation:
  key: Selenium
  parent: Browser Launchers
---

Browser launcher for Web Test Runner using Selenium.

For testing on modern browsers we don't recommend using Selenium, as it does not support running tests in parallel and there are better options available.

See [@web/test-runner](https://github.com/modernweb-dev/web/tree/master/packages/test-runner) for a default implementation and CLI for the test runner.

## Usage

1. Make sure you have a selenium server running, either locally or remote.

2. Add the selenium launcher to your test runner config, specifying the browser builder with the necessary options:

```js
const { seleniumLauncher } = require('@web/test-runner-selenium');
const { Builder } = require('selenium-webdriver');

module.exports = {
  browsers: seleniumLauncher({
    driverBuilder: new Builder()
      .forBrowser('chrome')
      .setChromeOptions(new ChromeOptions().headless())
      .usingServer('http://localhost:4444/wd/hub'),
  }),
};
```
