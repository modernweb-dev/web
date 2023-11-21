import path from 'path';
import { runTests } from '@web/test-runner-core/dist/test-helpers.js';
import { chromeLauncher } from '@web/test-runner-chrome';
import { fileURLToPath } from 'node:url';

import { setUserAgentPlugin } from '../../src/setUserAgentPlugin.js';

const dirname = fileURLToPath(new URL('.', import.meta.url));

describe('setUserAgentPlugin', function test() {
  this.timeout(20000);

  it('can set the user agent on puppeteer', async () => {
    await runTests({
      files: [path.join(dirname, 'browser-test.js')],
      browsers: [chromeLauncher()],
      plugins: [setUserAgentPlugin()],
    });
  });
});
