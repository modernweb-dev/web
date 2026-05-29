import { describe, it } from 'node:test';
import path from 'path';
import { runTests } from '@web/test-runner-core/test-helpers';
import { chromeLauncher } from '@web/test-runner-chrome';

import { setUserAgentPlugin } from '../../dist/setUserAgentPlugin.js';

describe('setUserAgentPlugin', function test() {
  it('can set the user agent on puppeteer', async () => {
    await runTests({
      files: [path.join(import.meta.dirname, 'browser-test.js')],
      browsers: [chromeLauncher()],
      plugins: [setUserAgentPlugin()],
    });
  });
});
