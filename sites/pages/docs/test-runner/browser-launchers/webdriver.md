# Test Runner >> Browser Launchers >> Webdriver ||80

Run tests using [WebdriverIO](https://webdriver.io).

## Usage

1. Make sure you have a selenium server running, either locally or remote.

2. Add the Webdriver launcher to your test runner config and specify relevant [options](https://webdriver.io/docs/options.html):

```js
import { webdriverLauncher } from '@web/test-runner-webdriver';

module.exports = {
  browsers: [
    webdriverLauncher({
      automationProtocol: 'webdriver',
      path: '/wd/hub/',
      capabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
          args: ['--no-sandbox', '--headless'],
        },
      },
    }),
    webdriverLauncher({
      automationProtocol: 'webdriver',
      path: '/wd/hub/',
      capabilities: {
        browserName: 'firefox',
        'moz:firefoxOptions': {
          args: ['-headless'],
        },
      },
    }),
  ],
};
```
