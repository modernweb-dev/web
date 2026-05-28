import path from 'path';
import { runTests } from '@web/test-runner-core/test-helpers';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { chromeLauncher } from '@web/test-runner-chrome';

import { visualRegressionPlugin } from '../dist/visualRegressionPlugin.js';
import { fileExists } from '../dist/fs.js';
import { playwrightLauncher } from '@web/test-runner-playwright';

describe('visualRegressionPlugin', { timeout: 20000 }, () => {
  it('can run a passing test', async () => {
    await runTests({
      files: [path.join(import.meta.dirname, 'diff-pass-test.js')],
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
        files: [path.join(import.meta.dirname, 'diff-fail-test.js')],
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
      assert.ok(
        session.testResults!.tests[0].error!.message.includes(
          'Visual diff failed. New screenshot is ',
        ),
      );
      assert.equal(
        await fileExists(
          path.resolve(
            import.meta.dirname,
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
            import.meta.dirname,
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
