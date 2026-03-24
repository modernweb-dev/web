import { describe, it } from 'node:test';
import path from 'path';
import { runTests } from '@web/test-runner-core/test-helpers';
import { chromeLauncher } from '@web/test-runner-chrome';
import { playwrightLauncher } from '@web/test-runner-playwright';

import { emulateMediaPlugin } from '../../src/emulateMediaPlugin.ts';

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
