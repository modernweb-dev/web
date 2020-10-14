import selenium from 'selenium-standalone';
import { Builder } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome';
import { Options as FirefoxOptions } from 'selenium-webdriver/firefox';
import os from 'os';
import { runIntegrationTests } from '../../../integration/test-runner';
import { seleniumLauncher } from '../src/seleniumLauncher';

async function startSeleniumServer() {
  await new Promise((resolve, reject) =>
    selenium.install(err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    }),
  );

  return new Promise<selenium.ChildProcess>((resolve, reject) =>
    selenium.start((err, server) => {
      if (err) {
        reject(err);
      } else {
        resolve(server);
      }
    }),
  );
}

let seleniumServer: selenium.ChildProcess;

// selenium doesn't work on windows in the CI
if (os.platform() !== 'win32') {
  before(async function () {
    this.timeout(50000);
    seleniumServer = await startSeleniumServer();
  });

  describe('test-runner-selenium', function testRunnerSelenium() {
    this.timeout(50000);

    function createConfig() {
      return {
        browserStartTimeout: 1000 * 60 * 2,
        testsStartTimeout: 1000 * 60 * 2,
        testsFinishTimeout: 1000 * 60 * 2,
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
    }

    runIntegrationTests(createConfig, {
      basic: true,
      groups: true,
      parallel: true,
      testFailure: true,
      locationChanged: true,
    });
  });

  after(() => {
    seleniumServer.kill();
  });
}
