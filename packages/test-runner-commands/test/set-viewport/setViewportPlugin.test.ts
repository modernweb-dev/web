import path from 'path';
import { runTests } from '@web/test-runner-core/dist/test-helpers';
import { chromeLauncher } from '@web/test-runner-chrome';
import { playwrightLauncher } from '@web/test-runner-playwright';
import { testRunnerServer } from '@web/test-runner-server';

import { setViewportPlugin } from '../../src/setViewportPlugin';

describe('setViewportPlugin', function test() {
  this.timeout(10000);

  it('can set the viewport on puppeteer', async () => {
    await runTests(
      {
        browsers: [chromeLauncher()],
        server: testRunnerServer({
          plugins: [setViewportPlugin()],
        }),
      },
      [path.join(__dirname, 'browser-test.js')],
    );
  });

  it('can set the viewport on playwright', async () => {
    await runTests(
      {
        browsers: [
          playwrightLauncher({ product: 'chromium' }),
          playwrightLauncher({ product: 'firefox' }),
          // TODO: make webkit work in the CI
          // playwrightLauncher({ product: 'webkit' }),
        ],
        server: testRunnerServer({
          plugins: [setViewportPlugin()],
        }),
      },
      [path.join(__dirname, 'browser-test.js')],
    );
  });
});
