import path from 'path';
import { platform } from 'os';
import { runTests } from '@web/test-runner-core/dist/test-helpers';
import { chromeLauncher } from '@web/test-runner-chrome';
import { playwrightLauncher } from '@web/test-runner-playwright';
import { testRunnerServer } from '@web/test-runner-server';

import { emulateMediaPlugin } from '../../src/emulateMediaPlugin';

describe('emulateMediaPlugin', function test() {
  this.timeout(20000);

  it('can emulate media on puppeteer', async () => {
    await runTests(
      {
        browsers: [chromeLauncher()],
        server: testRunnerServer({
          plugins: [emulateMediaPlugin()],
        }),
      },
      [path.join(__dirname, 'browser-test.js'), path.join(__dirname, 'puppeteer-only-test.js')],
    );
  });

  // playwright doesn't work on windows VM right now
  if (platform() !== 'win32') {
    it('can emulate media on playwright', async () => {
      await runTests(
        {
          browsers: [
            playwrightLauncher({ product: 'chromium' }),
            playwrightLauncher({ product: 'firefox' }),
            // TODO: make webkit work in the CI
            // playwrightLauncher({ product: 'webkit' }),
          ],
          server: testRunnerServer({
            plugins: [emulateMediaPlugin()],
          }),
        },
        [path.join(__dirname, 'browser-test.js')],
      );
    });
  }
});
