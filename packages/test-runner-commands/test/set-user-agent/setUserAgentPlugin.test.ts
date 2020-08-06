import path from 'path';
import { runTests } from '@web/test-runner-core/dist/test-helpers';
import { chromeLauncher } from '@web/test-runner-chrome';
import { testRunnerServer } from '@web/test-runner-server';

import { setUserAgentPlugin } from '../../src/setUserAgentPlugin';

describe('setUserAgentPlugin', function test() {
  this.timeout(20000);

  it('can set the user agent on puppeteer', async () => {
    await runTests(
      {
        browsers: [chromeLauncher()],
        server: testRunnerServer({
          plugins: [setUserAgentPlugin()],
        }),
      },
      [path.join(__dirname, 'browser-test.js')],
    );
  });
});
