import path from 'path';
import { platform } from 'os';
import selenium from 'selenium-standalone';
import { runTests } from '@web/test-runner-core/test-helpers';
import { chromeLauncher } from '@web/test-runner-chrome';
import { webdriverLauncher } from '@web/test-runner-webdriver';
import { playwrightLauncher } from '@web/test-runner-playwright';
import { sendMousePlugin } from '../../src/sendMousePlugin';
import { startSeleniumServer } from '../selenium-server';

let seleniumServer: selenium.ChildProcess;

describe('sendMousePlugin', function test() {
  this.timeout(20000);

  before(async function () {
    seleniumServer = await startSeleniumServer({
      chrome: { version: 'latest' },
      firefox: { version: 'latest' },
    });
  });

  after(() => {
    seleniumServer.kill();
  });

  it('can send mouse on puppeteer', async () => {
    await runTests({
      files: [path.join(__dirname, 'browser-test.js')],
      browsers: [chromeLauncher()],
      plugins: [sendMousePlugin()],
    });
  });

  // playwright doesn't work on windows VM right now
  if (platform() !== 'win32') {
    it('can send mouse on playwright', async () => {
      await runTests({
        files: [path.join(__dirname, 'browser-test.js')],
        browsers: [
          playwrightLauncher({ product: 'chromium' }),
          playwrightLauncher({ product: 'firefox' }),
          playwrightLauncher({ product: 'webkit' }),
        ],
        plugins: [sendMousePlugin()],
      });
    });
  }

  it('can send mouse on webdriver', async () => {
    await runTests({
      files: [path.join(__dirname, 'browser-test.js')],
      concurrency: 1,
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
      plugins: [sendMousePlugin()],
    });
  });
});
