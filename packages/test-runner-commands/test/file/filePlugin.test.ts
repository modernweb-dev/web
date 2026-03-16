import { describe, it } from 'node:test';
import path from 'path';
<<<<<<< HEAD
import { runTests } from '@web/test-runner-core/test-helpers';
||||||| parent of aecfa949 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { runTests } from '@web/test-runner-core/test-helpers.js';
=======
<<<<<<< HEAD
import { runTests } from '@web/test-runner-core/test-helpers.js';
import { chromeLauncher } from '@web/test-runner-chrome.js';
||||||| parent of 9007e014 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { runTests } from '@web/test-runner-core/test-helpers.ts';
import { chromeLauncher } from '@web/test-runner-chrome.ts';
=======
import { runTests } from '@web/test-runner-core/test-helpers';
>>>>>>> aecfa949 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { chromeLauncher } from '@web/test-runner-chrome';
>>>>>>> 9007e014 (chore: migrate tests from mocha/chai to node:test + node:assert)

<<<<<<< HEAD
import { filePlugin } from '../../src/filePlugin.ts';
||||||| parent of aecfa949 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { filePlugin } from '../../dist/filePlugin.ts';
=======
<<<<<<< HEAD
import { filePlugin } from '../../src/filePlugin.js';
||||||| parent of c37bb778 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { filePlugin } from '../../src/filePlugin.ts';
=======
<<<<<<< HEAD
import { filePlugin } from '../../src/filePlugin.ts';
||||||| parent of 61bf92a0 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { filePlugin } from '../../src/filePlugin.js';
=======
import { filePlugin } from '../../dist/filePlugin.js';
>>>>>>> 61bf92a0 (chore: migrate tests from mocha/chai to node:test + node:assert)
>>>>>>> c37bb778 (chore: migrate tests from mocha/chai to node:test + node:assert)
>>>>>>> aecfa949 (chore: migrate tests from mocha/chai to node:test + node:assert)

const __dirname = import.meta.dirname;

describe('filePlugin', { timeout: 20000 }, () => {

  it('passes file plugin tests', async () => {
    await runTests({
      files: [path.join(__dirname, 'browser-test.js')],
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
