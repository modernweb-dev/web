import { describe, it } from 'node:test';
import path from 'path';
import { runTests } from '@web/test-runner-core/test-helpers';
import { chromeLauncher } from '@web/test-runner-chrome';
import { playwrightLauncher } from '@web/test-runner-playwright';

import { selectOptionPlugin } from '../../dist/selectOptionPlugin.ts';

const __dirname = import.meta.dirname;

describe('selectOptionPlugin', { timeout: 20000 }, () => {

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
