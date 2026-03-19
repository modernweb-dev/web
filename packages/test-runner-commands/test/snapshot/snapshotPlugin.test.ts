import path from 'path';
import { runTests } from '@web/test-runner-core/test-helpers.ts';
import { playwrightLauncher } from '@web/test-runner-playwright.ts';

import { snapshotPlugin } from '../../dist/snapshotPlugin.ts';

describe('snapshotPlugin', function test() {
  this.timeout(20000);

  it('passes snapshot tests', async () => {
    await runTests({
      files: [path.join(__dirname, 'browser-test.js')],
      browsers: [
        playwrightLauncher({ product: 'firefox' }),
        playwrightLauncher({ product: 'chromium' }),
        playwrightLauncher({ product: 'webkit' }),
      ],
      plugins: [snapshotPlugin()],
    });

    await runTests({
      files: [path.join(__dirname, 'src', 'nested-test.js')],
      browsers: [
        playwrightLauncher({ product: 'firefox' }),
        playwrightLauncher({ product: 'chromium' }),
        playwrightLauncher({ product: 'webkit' }),
      ],
      plugins: [snapshotPlugin()],
    });
  });
});
