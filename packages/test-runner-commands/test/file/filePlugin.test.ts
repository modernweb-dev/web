import path from 'path';
import { runTests } from '@web/test-runner-core/dist/test-helpers.js';
import { chromeLauncher } from '@web/test-runner-chrome';
import { fileURLToPath } from 'node:url';

import { filePlugin } from '../../src/filePlugin.js';

const dirname = fileURLToPath(new URL('.', import.meta.url));

describe('filePlugin', function test() {
  this.timeout(20000);

  it('passes file plugin tests', async () => {
    await runTests({
      files: [path.join(dirname, 'browser-test.js')],
      browsers: [chromeLauncher()],
      plugins: [filePlugin()],
      logger: {
        ...console,
        error() {
          // ignore errors as they're expected in tests
        },
        debug() {
          //
        },
        logSyntaxError(error) {
          console.error(error);
        },
      },
    });
  });
});
