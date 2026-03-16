import { describe, it, before, after } from 'node:test';
import path from 'path';
import selenium from 'selenium-standalone';
<<<<<<< HEAD
import { runTests } from '@web/test-runner-core/test-helpers.js';
import { chromeLauncher } from '@web/test-runner-chrome';
import { webdriverLauncher } from '@web/test-runner-webdriver';
import { playwrightLauncher } from '@web/test-runner-playwright';
import { sendMousePlugin } from '../../dist/sendMousePlugin.ts';
||||||| parent of 9007e014 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { runTests } from '@web/test-runner-core/test-helpers.ts';
import { chromeLauncher } from '@web/test-runner-chrome.ts';
import { webdriverLauncher } from '@web/test-runner-webdriver.ts';
import { playwrightLauncher } from '@web/test-runner-playwright.ts';
import { sendMousePlugin } from '../../dist/sendMousePlugin.ts';
=======
import { runTests } from '@web/test-runner-core/test-helpers';
import { chromeLauncher } from '@web/test-runner-chrome';
import { webdriverLauncher } from '@web/test-runner-webdriver';
import { playwrightLauncher } from '@web/test-runner-playwright';
<<<<<<< HEAD
import { sendMousePlugin } from '../../src/sendMousePlugin.js';
import { startSeleniumServer } from '../selenium-server.js';
||||||| parent of c37bb778 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { sendMousePlugin } from '../../src/sendMousePlugin.ts';
>>>>>>> 9007e014 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { startSeleniumServer } from '../selenium-server.ts';
=======
<<<<<<< HEAD
import { sendMousePlugin } from '../../src/sendMousePlugin.ts';
import { startSeleniumServer } from '../selenium-server.ts';
||||||| parent of 61bf92a0 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { sendMousePlugin } from '../../src/sendMousePlugin.js';
import { startSeleniumServer } from '../selenium-server.js';
=======
import { sendMousePlugin } from '../../dist/sendMousePlugin.js';
import { startSeleniumServer } from '../selenium-server.js';
>>>>>>> 61bf92a0 (chore: migrate tests from mocha/chai to node:test + node:assert)
>>>>>>> c37bb778 (chore: migrate tests from mocha/chai to node:test + node:assert)

const __dirname = import.meta.dirname;

describe('sendMousePlugin', { timeout: 50000 }, () => {

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

  /**
   * Temporarily disabled until webdriver selenium-standalone issues are fixed
   * https://github.com/webdriverio/selenium-standalone/issues/788
   */
  describe.skip('webdriver', () => {
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
            hostname: 'localhost',
            port: 4444,
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
            hostname: 'localhost',
            port: 4444,
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
