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

import { emulateMediaPlugin } from '../../dist/emulateMediaPlugin.js';

const __dirname = import.meta.dirname;

describe('emulateMediaPlugin', { timeout: 20000 }, () => {

  it('can emulate media on puppeteer', async () => {
    await runTests({
      files: [
        path.join(__dirname, 'browser-test.js'),
        path.join(__dirname, 'prefers-reduced-motion-test.js'),
      ],

      browsers: [chromeLauncher()],
      plugins: [emulateMediaPlugin()],
    });
  });

  it('can emulate media on playwright', async () => {
    await runTests({
      files: [
        path.join(__dirname, 'browser-test.js'),
        path.join(__dirname, 'prefers-reduced-motion-test.js'),
      ],
      browsers: [
        playwrightLauncher({ product: 'chromium' }),
        playwrightLauncher({ product: 'firefox' }),
        playwrightLauncher({ product: 'webkit' }),
      ],
      plugins: [emulateMediaPlugin()],
    });
  });

  it('can emulate forced-colors on playwright, except webkit', async () => {
    await runTests({
      files: [path.join(__dirname, 'forced-colors-test.js')],
      browsers: [
        playwrightLauncher({ product: 'chromium' }),
        playwrightLauncher({ product: 'firefox' }),
      ],
      plugins: [emulateMediaPlugin()],
    });
  });
});
