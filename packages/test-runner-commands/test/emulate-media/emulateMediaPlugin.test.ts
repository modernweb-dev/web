import { describe, it } from 'node:test';
import path from 'path';
import { runTests } from '@web/test-runner-core/test-helpers';
import { chromeLauncher } from '@web/test-runner-chrome';
import { playwrightLauncher } from '@web/test-runner-playwright';

import { emulateMediaPlugin } from '../../dist/emulateMediaPlugin.js';

describe('emulateMediaPlugin', function test() {
  it('can emulate media on puppeteer', async () => {
    await runTests({
      files: [
        path.join(import.meta.dirname, 'browser-test.js'),
        path.join(import.meta.dirname, 'prefers-reduced-motion-test.js'),
      ],

      browsers: [chromeLauncher()],
      plugins: [emulateMediaPlugin()],
    });
  });

  it('can emulate media on playwright', async () => {
    await runTests({
      files: [
        path.join(import.meta.dirname, 'browser-test.js'),
        path.join(import.meta.dirname, 'prefers-reduced-motion-test.js'),
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
      files: [path.join(import.meta.dirname, 'forced-colors-test.js')],
      browsers: [
        playwrightLauncher({ product: 'chromium' }),
        playwrightLauncher({ product: 'firefox' }),
      ],
      plugins: [emulateMediaPlugin()],
    });
  });
});
