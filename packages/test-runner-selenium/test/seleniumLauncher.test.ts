import selenium from 'selenium-standalone';
import { Builder } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome';
import { Options as FirefoxOptions } from 'selenium-webdriver/firefox';
import os from 'os';
import { runIntegrationTests } from '../../../integration/test-runner';
import { seleniumLauncher } from '../src/seleniumLauncher';

async function startSeleniumServer() {
  let server;

  try {
    await selenium.install({
      drivers: {
        chrome: { version: 'latest' },
        firefox: { version: 'latest' },
      },
    });
  } catch (err) {
    console.error('Error occurred when installing selenium.');
    throw err;
  }

  try {
    server = await selenium.start({
      drivers: {
        chrome: { version: 'latest' },
        firefox: { version: 'latest' },
      },
    });
  } catch (err) {
    console.error('Error occurred when starting selenium.');
    throw err;
  }

  return server;
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
      many: true,
      focus: false,
      groups: true,
      parallel: true,
      testFailure: true,
      // FIXME: timed out with selenium-standalone v7
      locationChanged: false,
    });
  });

  after(() => {
    seleniumServer.kill();
  });
}
