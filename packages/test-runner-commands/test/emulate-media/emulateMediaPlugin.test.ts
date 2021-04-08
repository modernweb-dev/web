import path from 'path';
import { platform } from 'os';
import { runTests } from '@web/test-runner-core/test-helpers';
import { chromeLauncher } from '@web/test-runner-chrome';
import { playwrightLauncher } from '@web/test-runner-playwright';

import { emulateMediaPlugin } from '../../src/emulateMediaPlugin';

describe('emulateMediaPlugin', function test() {
  this.timeout(20000);

  it('can emulate media on puppeteer', async () => {
    await runTests({
      files: [
        path.join(__dirname, 'browser-test.js'),
        path.join(__dirname, 'puppeteer-only-test.js'),
      ],

      browsers: [chromeLauncher()],
      plugins: [emulateMediaPlugin()],
    });
  });

  // playwright doesn't work on windows VM right now
  if (platform() !== 'win32') {
    it('can emulate media on playwright', async () => {
      await runTests({
        files: [path.join(__dirname, 'browser-test.js')],
        browsers: [
          playwrightLauncher({ product: 'chromium' }),
          playwrightLauncher({ product: 'firefox' }),
          playwrightLauncher({ product: 'webkit' }),
        ],
        plugins: [emulateMediaPlugin()],
      });
    });
  }
});
