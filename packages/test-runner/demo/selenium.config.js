const selenium = require('selenium-standalone');
const { Builder } = require('selenium-webdriver');
const { Options: ChromeOptions } = require('selenium-webdriver/chrome');
const { Options: FirefoxOptions } = require('selenium-webdriver/firefox');
const { seleniumLauncher } = require('@web/test-runner-selenium');

module.exports = {
  rootDir: '../../../',
  files: ['demo/test/pass-*.test.js'],
  // files: ['demo/test/pass-1.test.js'],
  preserveSymlinks: true,
  nodeResolve: true,

  browsers: [
    seleniumLauncher({
      // experimentalIframeMode: true,
      driverBuilder: new Builder()
        .forBrowser('chrome')
        .setChromeOptions(new ChromeOptions().headless())
        .usingServer('http://localhost:4444/wd/hub'),
    }),

    // seleniumLauncher({
    //   driverBuilder: new Builder()
    //     .forBrowser('firefox')
    //     // .setFirefoxOptions(new FirefoxOptions().headless())
    //     .usingServer('http://localhost:4444/wd/hub'),
    // }),
  ],
};
