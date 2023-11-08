import path from 'path';
import { runTests } from '@web/test-runner-core/test-helpers';
import { playwrightLauncher } from '@web/test-runner-playwright';

import { snapshotPlugin } from '../../src/snapshotPlugin.js';

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
