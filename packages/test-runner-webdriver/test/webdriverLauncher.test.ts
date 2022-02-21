import selenium from 'selenium-standalone';
import { runIntegrationTests } from '../../../integration/test-runner';
import { webdriverLauncher } from '../src/webdriverLauncher';

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

describe('test-runner-webdriver', function testRunnerWebdriver() {
  this.timeout(50000);

  before(async function () {
    seleniumServer = await startSeleniumServer();
  });

  after(() => {
    seleniumServer.kill();
  });

  function createConfig() {
    return {
      browserStartTimeout: 1000 * 60 * 2,
      testsStartTimeout: 1000 * 60 * 2,
      testsFinishTimeout: 1000 * 60 * 2,
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
  }

  runIntegrationTests(createConfig, {
    basic: true,
    many: true,
    // focus fails with headless webdriver
    focus: false,
    groups: true,
    parallel: true,
    testFailure: true,
    // FIXME: timed out with selenium-standalone v7
    locationChanged: false,
  });
});
