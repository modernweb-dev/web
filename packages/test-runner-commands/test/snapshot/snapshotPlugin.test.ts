import { describe,it } from 'node:test';
import path from 'path';
import { runTests } from '@web/test-runner-core/test-helpers';
import { playwrightLauncher } from '@web/test-runner-playwright';

import { snapshotPlugin } from '../../dist/snapshotPlugin.js';

describe('snapshotPlugin', function test() {

  it('passes snapshot tests', async () => {
    await runTests({
      files: [path.join(import.meta.dirname, 'browser-test.js')],
      browsers: [
        playwrightLauncher({ product: 'firefox' }),
        playwrightLauncher({ product: 'chromium' }),
        playwrightLauncher({ product: 'webkit' }),
      ],
      plugins: [snapshotPlugin()],
    });

    await runTests({
      files: [path.join(import.meta.dirname, 'src', 'nested-test.js')],
      browsers: [
        playwrightLauncher({ product: 'firefox' }),
        playwrightLauncher({ product: 'chromium' }),
        playwrightLauncher({ product: 'webkit' }),
      ],
      plugins: [snapshotPlugin()],
    });
  });
});
