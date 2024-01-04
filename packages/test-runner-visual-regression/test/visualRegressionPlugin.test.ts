import path from 'path';
import { runTests } from '@web/test-runner-core/test-helpers';
import { expect } from 'chai';
import { chromeLauncher } from '@web/test-runner-chrome';

import { visualRegressionPlugin } from '../src/visualRegressionPlugin.js';
import { fileExists } from '../src/fs.js';
import { playwrightLauncher } from '@web/test-runner-playwright';

describe('visualRegressionPlugin', function test() {
  this.timeout(20000);

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

    expect(sessions.length).to.equal(3);

    for (const session of sessions) {
      expect(session.passed).to.equal(false);
      expect(session.testResults!.tests.length).to.equal(1);
      expect(session.testResults!.tests[0].error!.message).to.include(
        'Visual diff failed. New screenshot is ',
      );
      expect(
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
      ).to.equal(true);
      expect(
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
      ).to.equal(true);
    }
  });
});
