import { chromeLauncher } from '@web/test-runner-chrome';
import { runTests } from '@web/test-runner-core/test-helpers';
import { playwrightLauncher } from '@web/test-runner-playwright';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import path from 'path';

import { a11ySnapshotPlugin } from '../../dist/a11ySnapshotPlugin.js';

describe('a11ySnapshotPlugin', { timeout: 20000 }, () => {
  it('can find accessibility nodes in the returned accessibility tree on puppeteer', async () => {
    await runTests({
      files: [path.join(import.meta.dirname, 'browser-test.js')],
      browsers: [chromeLauncher()],
      plugins: [a11ySnapshotPlugin()],
    });
  });

  it('returns the chromium accessibility tree on playwright', async () => {
    await runTests({
      files: [
        path.join(import.meta.dirname, 'browser-test.js'),
        path.join(import.meta.dirname, 'browser-test-chromium.js'),
      ],
      browsers: [playwrightLauncher({ product: 'chromium' })],
      plugins: [a11ySnapshotPlugin()],
    });
  });

  it('throws a clear error on playwright firefox and webkit', async () => {
    const { sessions } = await runTests(
      {
        files: [path.join(import.meta.dirname, 'browser-test.js')],
        browsers: [
          playwrightLauncher({ product: 'firefox' }),
          playwrightLauncher({ product: 'webkit' }),
        ],
        plugins: [a11ySnapshotPlugin()],
      },
      [],
      { allowFailure: true, reportErrors: false },
    );

    assert.equal(sessions.length, 2);
    for (const session of sessions) {
      assert.equal(session.passed, false);
      assert.match(
        session.testResults!.tests[0].error!.message,
        /Accessibility snapshot is not supported for Firefox and WebKit in Playwright 1\.57 and later\./,
      );
    }
  });
});
