import path from 'path';
import { runTests } from '@web/test-runner-core/dist/test-helpers.js';
import { playwrightLauncher } from '@web/test-runner-playwright';
import { fileURLToPath } from 'node:url';

import { snapshotPlugin } from '../../src/snapshotPlugin.js';

const dirname = fileURLToPath(new URL('.', import.meta.url));

describe('snapshotPlugin', function test() {
  this.timeout(20000);

  it('passes snapshot tests', async () => {
    await runTests({
      files: [path.join(dirname, 'browser-test.js')],
      browsers: [
        playwrightLauncher({ product: 'firefox' }),
        playwrightLauncher({ product: 'chromium' }),
        playwrightLauncher({ product: 'webkit' }),
      ],
      plugins: [snapshotPlugin()],
    });

    await runTests({
      files: [path.join(dirname, 'src', 'nested-test.js')],
      browsers: [
        playwrightLauncher({ product: 'firefox' }),
        playwrightLauncher({ product: 'chromium' }),
        playwrightLauncher({ product: 'webkit' }),
      ],
      plugins: [snapshotPlugin()],
    });
  });
});
