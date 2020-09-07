const selenium = require('selenium-standalone');
const { Builder } = require('selenium-webdriver');
const { Options: ChromeOptions } = require('selenium-webdriver/chrome');
const { Options: FirefoxOptions } = require('selenium-webdriver/firefox');
const { seleniumLauncher } = require('@web/test-runner-selenium');

const installPromise = new Promise((resolve, reject) => {
  selenium.install(err => {
    if (err) {
      reject(err);
    } else {
      resolve();
    }
  });
});

let seleniumServer;

module.exports = {
  rootDir: '../../../',
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

  plugins: [
    {
      async serverStart() {
        await installPromise;
        seleniumServer = await new Promise((resolve, reject) => {
          selenium.start((err, server) => {
            if (err) {
              reject(err);
            } else {
              resolve(server);
            }
          });
        });
      },

      serverStop() {
        seleniumServer.kill();
      },
    },
  ],
};
