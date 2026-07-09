import { describe, it } from 'node:test';
import path from 'path';

import { chromeLauncher } from '@web/test-runner-chrome';
import { runTests } from '@web/test-runner-core/test-helpers';
import { playwrightLauncher } from '@web/test-runner-playwright';

import { setViewportPlugin } from '../../dist/setViewportPlugin.js';

describe('setViewportPlugin', { timeout: 20000 }, () => {
  it('can set the viewport on puppeteer', async () => {
    await runTests({
      files: [path.join(import.meta.dirname, 'browser-test.js')],
      browsers: [chromeLauncher()],
      plugins: [setViewportPlugin()],
    });
  });

  it('can set the viewport on playwright', async () => {
    await runTests({
      files: [path.join(import.meta.dirname, 'browser-test.js')],
      browsers: [
        playwrightLauncher({ product: 'chromium' }),
        playwrightLauncher({ product: 'firefox' }),
        playwrightLauncher({ product: 'webkit' }),
      ],
      plugins: [setViewportPlugin()],
    });
  });
});
