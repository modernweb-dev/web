import path from 'path';
import { runTests } from '@web/test-runner-core/test-helpers';
import { chromeLauncher } from '@web/test-runner-chrome';
import { playwrightLauncher } from '@web/test-runner-playwright';

import { a11ySnapshotPlugin } from '../../src/a11ySnapshotPlugin.js';

describe('a11ySnapshotPlugin', function test() {
  this.timeout(20000);

  it('can find accessibility nodes in the returned accessibility tree on puppeteer', async () => {
    await runTests({
      files: [path.join(__dirname, 'browser-test.js')],
      browsers: [chromeLauncher()],
      plugins: [a11ySnapshotPlugin()],
    });
  });

  it('can find accessibility nodes in the returned accessibility tree on playwright', async () => {
    await runTests({
      files: [path.join(__dirname, 'browser-test.js')],
      browsers: [
        playwrightLauncher({ product: 'chromium' }),
        playwrightLauncher({ product: 'firefox' }),
        playwrightLauncher({ product: 'webkit' }),
      ],
      plugins: [a11ySnapshotPlugin()],
    });
  });
});
