# Web Test Runner Selenium

Browser launcher for Web Test Runner using Selenium.

## Usage

1. Make sure you have a selenium server running, either locally or remote.

2. Add the selenium launcher to your test runner config, specifying the browser builder with the necessary options:

```js
import { seleniumLauncher } from '@web/test-runner-selenium';
import { Builder } from 'selenium-webdriver';

export default {
  browserLauncher: seleniumLauncher({
    driverBuilder: new Builder()
      .forBrowser('chrome')
      .setChromeOptions(new ChromeOptions().headless())
      .usingServer('http://localhost:4444/wd/hub'),
  }),
};
```
