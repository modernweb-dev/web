import { seleniumLauncher } from '@web/test-runner-selenium';
import { Builder } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome.js';
import { Options as FirefoxOptions } from 'selenium-webdriver/firefox.js';

export default {
  rootDir: '../../../',
  files: 'demo/test/pass-!(commands)*.test.js',
  preserveSymlinks: true,
  nodeResolve: true,

  browsers: [
    seleniumLauncher({
      driverBuilder: new Builder()
        .forBrowser('chrome')
        .setChromeOptions(new ChromeOptions().headless())
        .usingServer('http://localhost:4444/wd/hub'),
    }),

    seleniumLauncher({
      driverBuilder: new Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(new FirefoxOptions().headless())
        .usingServer('http://localhost:4444/wd/hub'),
    }),
  ],
};
