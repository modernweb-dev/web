import path from 'path';
import { runTests } from '@web/test-runner-core/test-helpers';
import { chromeLauncher } from '@web/test-runner-chrome';

import { snapshotPlugin } from '../../src/snapshotPlugin';

describe.only('snapshotPlugin', function test() {
  this.timeout(20000);

  it('passes snapshot tests', async () => {
    await runTests({
      files: [path.join(__dirname, 'browser-test.js')],
      browsers: [chromeLauncher()],
      plugins: [snapshotPlugin()],
    });

    await runTests({
      files: [path.join(__dirname, 'src', 'nested-test.js')],
      browsers: [chromeLauncher()],
      plugins: [snapshotPlugin()],
    });
  });
});
