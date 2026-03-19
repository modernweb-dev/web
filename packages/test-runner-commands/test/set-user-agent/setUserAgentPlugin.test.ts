import path from 'path';
import { runTests } from '@web/test-runner-core/test-helpers';
import { chromeLauncher } from '@web/test-runner-chrome';

import { setUserAgentPlugin } from '../../src/setUserAgentPlugin.js';

describe('setUserAgentPlugin', function test() {
  this.timeout(20000);

  it('can set the user agent on puppeteer', async () => {
    await runTests({
      files: [path.join(__dirname, 'browser-test.js')],
      browsers: [chromeLauncher()],
      plugins: [setUserAgentPlugin()],
    });
  });
});
