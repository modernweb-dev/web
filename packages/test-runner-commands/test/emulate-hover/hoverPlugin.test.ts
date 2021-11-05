import path from 'path';
import { platform } from 'os';
import selenium from 'selenium-standalone';
import { TestRunnerPlugin } from '@web/test-runner-core';
import { runTests } from '@web/test-runner-core/test-helpers';
import { chromeLauncher } from '@web/test-runner-chrome';
import { webdriverLauncher } from '@web/test-runner-webdriver';
import { playwrightLauncher } from '@web/test-runner-playwright';
import { visualRegressionPlugin } from '@web/test-runner-visual-regression/plugin';

import { hoverPlugin } from '../../src/hoverPlugin';
import { startSeleniumServer } from '../selenium-server';

let seleniumServer: selenium.ChildProcess;

describe('hoverPlugin', function test() {
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

  function resolveCommandsPlugin(): TestRunnerPlugin {
    return {
      name: 'resolve-commands',
      resolveImport({ source }) {
        if (source === '@web/test-runner-visual-regression') {
          return '/packages/test-runner-visual-regression/browser/commands.mjs';
        }

        if (source === '@web/test-runner-commands') {
          return '/packages/test-runner-commands/browser/commands.mjs';
        }
      },
    };
  }

  it('can hover on puppeteer', async () => {
    await runTests({
      files: [path.join(__dirname, 'browser-test.js')],
      browsers: [chromeLauncher()],
      plugins: [
        hoverPlugin(),
        resolveCommandsPlugin(),
        visualRegressionPlugin({
          baseDir: 'packages/test-runner-commands/screenshots/hover/puppeteer',
          update: process.argv.includes('--update-visual-diffs'),
        }),
      ],
    });
  });

  it('can hover on webdriver', async () => {
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
      plugins: [
        hoverPlugin(),
        resolveCommandsPlugin(),
        visualRegressionPlugin({
          baseDir: 'packages/test-runner-commands/screenshots/hover/webdriver',
          update: process.argv.includes('--update-visual-diffs'),
        }),
      ],
    });
  });

  // playwright doesn't work on windows VM right now
  if (platform() !== 'win32') {
    it('can hover on playwright', async () => {
      await runTests({
        files: [path.join(__dirname, 'browser-test.js')],
        browsers: [
          playwrightLauncher({ product: 'chromium' }),
          playwrightLauncher({ product: 'firefox' }),
          playwrightLauncher({ product: 'webkit' }),
        ],
        plugins: [
          hoverPlugin(),
          resolveCommandsPlugin(),
          visualRegressionPlugin({
            baseDir: 'packages/test-runner-commands/screenshots/hover/playwright',
            update: process.argv.includes('--update-visual-diffs'),
          }),
        ],
      });
    });
  }
});
