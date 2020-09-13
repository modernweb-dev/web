import path from 'path';
import { platform } from 'os';
import { runTests } from '@web/test-runner-core/test-helpers';
import { chromeLauncher } from '@web/test-runner-chrome';
import { playwrightLauncher } from '@web/test-runner-playwright';

import { setViewportPlugin } from '../../src/setViewportPlugin';

describe('setViewportPlugin', function test() {
  this.timeout(20000);

  it('can set the viewport on puppeteer', async () => {
    await runTests({
      files: [path.join(__dirname, 'browser-test.js')],
      browsers: [chromeLauncher()],
      plugins: [setViewportPlugin()],
    });
  });

  // playwright doesn't work on windows VM right now
  if (platform() !== 'win32') {
    it('can set the viewport on playwright', async () => {
      await runTests({
        files: [path.join(__dirname, 'browser-test.js')],
        browsers: [
          playwrightLauncher({ product: 'chromium' }),
          playwrightLauncher({ product: 'firefox' }),
          // TODO: make webkit work in the CI
          // playwrightLauncher({ product: 'webkit' }),
        ],
        plugins: [setViewportPlugin()],
      });
    });
  }
});
