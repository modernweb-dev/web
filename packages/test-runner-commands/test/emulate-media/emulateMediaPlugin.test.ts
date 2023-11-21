import path from 'path';
import { runTests } from '@web/test-runner-core/dist/test-helpers.js';
import { chromeLauncher } from '@web/test-runner-chrome';
import { playwrightLauncher } from '@web/test-runner-playwright';
import { fileURLToPath } from 'node:url';

import { emulateMediaPlugin } from '../../src/emulateMediaPlugin.js';

const dirname = fileURLToPath(new URL('.', import.meta.url));

describe('emulateMediaPlugin', function test() {
  this.timeout(20000);

  it('can emulate media on puppeteer', async () => {
    await runTests({
      files: [
        path.join(dirname, 'browser-test.js'),
        path.join(dirname, 'prefers-reduced-motion-test.js'),
      ],

      browsers: [chromeLauncher()],
      plugins: [emulateMediaPlugin()],
    });
  });

  it('can emulate media on playwright', async () => {
    await runTests({
      files: [
        path.join(dirname, 'browser-test.js'),
        path.join(dirname, 'prefers-reduced-motion-test.js'),
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
      files: [path.join(dirname, 'forced-colors-test.js')],
      browsers: [
        playwrightLauncher({ product: 'chromium' }),
        playwrightLauncher({ product: 'firefox' }),
      ],
      plugins: [emulateMediaPlugin()],
    });
  });
});
