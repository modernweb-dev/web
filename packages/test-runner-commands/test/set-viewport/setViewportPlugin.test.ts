import { describe, it } from 'node:test';
import path from 'path';

import { runTests } from '@web/test-runner-core/test-helpers';
import { chromeLauncher } from '@web/test-runner-chrome';
import { playwrightLauncher } from '@web/test-runner-playwright';

import { setViewportPlugin } from '../../src/setViewportPlugin.ts';

const __dirname = import.meta.dirname;

describe('setViewportPlugin', { timeout: 20000 }, () => {
  it('can set the viewport on puppeteer', async () => {
    await runTests({
      files: [path.join(__dirname, 'browser-test.js')],
      browsers: [chromeLauncher()],
      plugins: [setViewportPlugin()],
    });
  });

  it('can set the viewport on playwright', async () => {
    await runTests({
      files: [path.join(__dirname, 'browser-test.js')],
      browsers: [
        playwrightLauncher({ product: 'chromium' }),
        playwrightLauncher({ product: 'firefox' }),
        playwrightLauncher({ product: 'webkit' }),
      ],
      plugins: [setViewportPlugin()],
    });
  });
});
