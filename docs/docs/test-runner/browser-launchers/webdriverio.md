# Test Runner >> Browser Launchers >> WebdriverIO ||80

Run tests using [WebdriverIO](https://webdriver.io).

## Usage

1. Make sure you have a selenium server running, either locally or remote.

2. Add the WebdriverIO launcher to your test runner config and specify relevant [options](https://webdriver.io/docs/options.html):

```js
import { webdriverIOLauncher } from '@web/test-runner-webdriverio';

module.exports = {
  browsers: [
    webdriverIOLauncher({
      automationProtocol: 'webdriver',
      path: '/wd/hub/',
      capabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
          args: ['headless', 'disable-gpu']
        }
      }
    })
    webdriverIOLauncher({
      automationProtocol: 'webdriver',
      path: '/wd/hub/',
      capabilities: {
        browserName: 'firefox',
        'moz:firefoxOptions': {
          args: ['-headless']
        }
      }
    })
  ]
};
```
