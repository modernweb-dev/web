import path from 'path';
import { runTests } from '@web/test-runner-core/dist/test-helpers.js';
import { chromeLauncher } from '@web/test-runner-chrome';
import { playwrightLauncher } from '@web/test-runner-playwright';
import { fileURLToPath } from 'node:url';

import { sendKeysPlugin } from '../../src/sendKeysPlugin.js';

const dirname = fileURLToPath(new URL('.', import.meta.url));

describe('sendKeysPlugin', function test() {
  this.timeout(20000);

  it('can send keys on puppeteer', async () => {
    await runTests({
      files: [path.join(dirname, 'browser-test.js')],
      browsers: [chromeLauncher()],
      plugins: [sendKeysPlugin()],
    });
  });

  it('can send keys on playwright', async () => {
    await runTests({
      files: [path.join(dirname, 'browser-test.js')],
      browsers: [
        playwrightLauncher({ product: 'chromium' }),
        playwrightLauncher({ product: 'firefox' }),
        playwrightLauncher({ product: 'webkit' }),
      ],
      plugins: [sendKeysPlugin()],
    });
  });
});
