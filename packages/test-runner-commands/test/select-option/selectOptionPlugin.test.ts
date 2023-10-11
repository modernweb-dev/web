import path from 'path';
import { runTests } from '@web/test-runner-core/test-helpers';
import { chromeLauncher } from '@web/test-runner-chrome';
import { playwrightLauncher } from '@web/test-runner-playwright';

import { selectOptionPlugin } from '../../src/selectOptionPlugin';

describe('selectOptionPlugin @slow', function test() {
  this.timeout(20000);

  it('can send keys on puppeteer', async () => {
    await runTests({
      files: [path.join(__dirname, 'puppeteer-test.js')],
      browsers: [chromeLauncher()],
      plugins: [selectOptionPlugin()],
    });
  });

  it('can send keys on playwright', async () => {
    await runTests({
      files: [path.join(__dirname, 'playwright-test.js')],
      browsers: [
        playwrightLauncher({ product: 'chromium' }),
        playwrightLauncher({ product: 'firefox' }),
        playwrightLauncher({ product: 'webkit' }),
      ],
      plugins: [selectOptionPlugin()],
    });
  });
});
