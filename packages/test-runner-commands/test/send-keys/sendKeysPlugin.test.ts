import { describe, it } from 'node:test';
import path from 'path';
<<<<<<< HEAD
import { runTests } from '@web/test-runner-core/test-helpers.js';
import { chromeLauncher } from '@web/test-runner-chrome.js';
import { playwrightLauncher } from '@web/test-runner-playwright.js';
||||||| parent of 9007e014 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { runTests } from '@web/test-runner-core/test-helpers.ts';
import { chromeLauncher } from '@web/test-runner-chrome.ts';
import { playwrightLauncher } from '@web/test-runner-playwright.ts';
=======
import { runTests } from '@web/test-runner-core/test-helpers';
import { chromeLauncher } from '@web/test-runner-chrome';
import { playwrightLauncher } from '@web/test-runner-playwright';
>>>>>>> 9007e014 (chore: migrate tests from mocha/chai to node:test + node:assert)

<<<<<<< HEAD
import { sendKeysPlugin } from '../../src/sendKeysPlugin.js';
||||||| parent of c37bb778 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { sendKeysPlugin } from '../../src/sendKeysPlugin.ts';
=======
<<<<<<< HEAD
import { sendKeysPlugin } from '../../src/sendKeysPlugin.ts';
||||||| parent of 61bf92a0 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { sendKeysPlugin } from '../../src/sendKeysPlugin.js';
=======
import { sendKeysPlugin } from '../../dist/sendKeysPlugin.js';
>>>>>>> 61bf92a0 (chore: migrate tests from mocha/chai to node:test + node:assert)
>>>>>>> c37bb778 (chore: migrate tests from mocha/chai to node:test + node:assert)

const __dirname = import.meta.dirname;

describe('sendKeysPlugin', { timeout: 20000 }, () => {

  it('can send keys on puppeteer', async () => {
    await runTests({
      files: [path.join(__dirname, 'browser-test.js')],
      browsers: [chromeLauncher()],
      plugins: [sendKeysPlugin()],
    });
  });

  it('can send keys on playwright', async () => {
    await runTests({
      files: [path.join(__dirname, 'browser-test.js')],
      browsers: [
        playwrightLauncher({ product: 'chromium' }),
        playwrightLauncher({ product: 'firefox' }),
        playwrightLauncher({ product: 'webkit' }),
      ],
      plugins: [sendKeysPlugin()],
    });
  });
});
