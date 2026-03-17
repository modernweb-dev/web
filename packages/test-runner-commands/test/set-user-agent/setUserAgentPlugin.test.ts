import { describe, it } from 'node:test';
import path from 'path';
<<<<<<< HEAD
import { runTests } from '@web/test-runner-core/test-helpers.js';
import { chromeLauncher } from '@web/test-runner-chrome.js';
||||||| parent of 9007e014 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { runTests } from '@web/test-runner-core/test-helpers.ts';
import { chromeLauncher } from '@web/test-runner-chrome.ts';
=======
import { runTests } from '@web/test-runner-core/test-helpers';
import { chromeLauncher } from '@web/test-runner-chrome';
>>>>>>> 9007e014 (chore: migrate tests from mocha/chai to node:test + node:assert)

import { setUserAgentPlugin } from '../../dist/setUserAgentPlugin.js';

const __dirname = import.meta.dirname;

describe('setUserAgentPlugin', { timeout: 20000 }, () => {

  it('can set the user agent on puppeteer', async () => {
    await runTests({
      files: [path.join(__dirname, 'browser-test.js')],
      browsers: [chromeLauncher()],
      plugins: [setUserAgentPlugin()],
    });
  });
});
