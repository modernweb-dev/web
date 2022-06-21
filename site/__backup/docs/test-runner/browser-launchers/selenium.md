# Test Runner >> Browser Launchers >> Selenium ||50

Run tests using [selenium-webdriver](https://www.npmjs.com/package/selenium-webdriver).

For testing on modern browsers, we don't recommend using Selenium, as it does not support running tests in parallel and there are better options available.

## Usage

1. Make sure you have a selenium server running, either locally or remote.

2. Add the selenium launcher to your test runner config, specifying the browser builder with the necessary options:

```js
import { seleniumLauncher } from '@web/test-runner-selenium';
import webdriver from 'selenium-webdriver';

module.exports = {
  browsers: seleniumLauncher({
    driverBuilder: new webdriver.Builder()
      .forBrowser('chrome')
      .setChromeOptions(new ChromeOptions().headless())
      .usingServer('http://localhost:4444/wd/hub'),
  }),
};
```
