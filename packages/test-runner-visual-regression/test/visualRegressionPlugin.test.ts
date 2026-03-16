import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
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

<<<<<<< HEAD
import { visualRegressionPlugin } from '../src/visualRegressionPlugin.ts';
import { fileExists } from '../src/fs.ts';
import { playwrightLauncher } from '@web/test-runner-playwright.js';
||||||| parent of 9007e014 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { visualRegressionPlugin } from '../src/visualRegressionPlugin.ts';
import { fileExists } from '../src/fs.ts';
import { playwrightLauncher } from '@web/test-runner-playwright.ts';
=======
import { visualRegressionPlugin } from '../src/visualRegressionPlugin.js';
import { fileExists } from '../src/fs.js';
import { playwrightLauncher } from '@web/test-runner-playwright';
>>>>>>> 9007e014 (chore: migrate tests from mocha/chai to node:test + node:assert)

const __dirname = import.meta.dirname;

describe('visualRegressionPlugin', { timeout: 30000 }, () => {

  it('can run a passing test', async () => {
    await runTests({
      files: [path.join(__dirname, 'diff-pass-test.js')],
      browsers: [
        chromeLauncher(),
        playwrightLauncher({ product: 'firefox' }),
        playwrightLauncher({ product: 'webkit' }),
      ],
      plugins: [
        {
          name: 'resolve-commands',
          resolveImport({ source }) {
            if (source === '@web/test-runner-commands') {
              return '/packages/test-runner-commands/browser/commands.mjs';
            }
          },
        },
        visualRegressionPlugin({
          baseDir: 'screenshots',
          update: process.argv.includes('--update-visual-diffs'),
        }),
      ],
    });
  });

  it('can run a failed test', async () => {
    const { sessions } = await runTests(
      {
        files: [path.join(__dirname, 'diff-fail-test.js')],
        browsers: [
          chromeLauncher(),
          playwrightLauncher({ product: 'firefox' }),
          playwrightLauncher({ product: 'webkit' }),
        ],
        plugins: [
          {
            name: 'resolve-commands',
            resolveImport({ source }) {
              if (source === '@web/test-runner-commands') {
                return '/packages/test-runner-commands/browser/commands.mjs';
              }
            },
          },
          visualRegressionPlugin({
            baseDir: 'screenshots',
            update: process.argv.includes('--update-visual-diffs'),
          }),
        ],
      },
      [],
      { allowFailure: true, reportErrors: false },
    );

    assert.equal(sessions.length, 3);

    for (const session of sessions) {
      assert.equal(session.passed, false);
      assert.equal(session.testResults!.tests.length, 1);
      assert(session.testResults!.tests[0].error!.message.includes(
        'Visual diff failed. New screenshot is ',
      ));
      assert.equal(
        await fileExists(
          path.resolve(
            __dirname,
            '..',
            'screenshots',
            session.browser.name,
            'failed',
            'my-failed-element.png',
          ),
        ),
        true,
      );
      assert.equal(
        await fileExists(
          path.resolve(
            __dirname,
            '..',
            'screenshots',
            session.browser.name,
            'failed',
            'my-failed-element-diff.png',
          ),
        ),
        true,
      );
    }
  });
});
