import os from 'os';
import selenium from 'selenium-standalone';
import { runIntegrationTests } from '../../../integration/test-runner';
import { webdriverIOLauncher } from '../src/webdriverIOLauncher';

async function startSeleniumServer() {
  await new Promise<void>((resolve, reject) =>
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

  describe('test-runner-webdriverio', function testRunnerWebdriverIO() {
    this.timeout(50000);

    function createConfig() {
      return {
        browserStartTimeout: 1000 * 60 * 2,
        testsStartTimeout: 1000 * 60 * 2,
        testsFinishTimeout: 1000 * 60 * 2,
        browsers: [
          webdriverIOLauncher({
            automationProtocol: 'webdriver',
            path: '/wd/hub/',
            capabilities: {
              browserName: 'chrome',
              'goog:chromeOptions': {
                args: ['headless', 'disable-gpu'],
              },
            },
          }),
          webdriverIOLauncher({
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
