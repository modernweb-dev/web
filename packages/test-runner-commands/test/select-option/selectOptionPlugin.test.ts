import path from 'path';
import { runTests } from '@web/test-runner-core/test-helpers.ts';
import { chromeLauncher } from '@web/test-runner-chrome.ts';
import { playwrightLauncher } from '@web/test-runner-playwright.ts';

import { selectOptionPlugin } from '../../dist/selectOptionPlugin.ts';

describe('selectOptionPlugin', function test() {
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
