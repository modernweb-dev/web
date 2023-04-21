import path from 'path';
import selenium from 'selenium-standalone';
import { runTests } from '@web/test-runner-core/test-helpers';
import { chromeLauncher } from '@web/test-runner-chrome';
import { webdriverLauncher } from '@web/test-runner-webdriver';
import { playwrightLauncher } from '@web/test-runner-playwright';
import { sendMousePlugin } from '../../src/sendMousePlugin';
import { startSeleniumServer } from '../selenium-server';

describe('sendMousePlugin', function test() {
  this.timeout(50000);

  it('can send mouse on puppeteer', async () => {
    await runTests({
      files: [path.join(__dirname, 'browser-test.js')],
      browsers: [chromeLauncher()],
      plugins: [sendMousePlugin()],
    });
  });

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

  describe('webdriver', () => {
    let seleniumServer!: selenium.ChildProcess;

    before(async () => {
      seleniumServer = await startSeleniumServer({
        chrome: { version: 'latest' },
        firefox: { version: 'latest' },
      });
    });

    after(() => {
      if (seleniumServer) {
        seleniumServer.kill();
      }
    });

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
});
