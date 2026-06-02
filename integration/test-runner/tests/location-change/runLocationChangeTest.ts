import assert from 'node:assert/strict';
import { describe, before, it } from 'node:test';
import type { BrowserLauncher, TestRunnerCoreConfig, TestSession } from '@web/test-runner-core';
import { runTests } from '@web/test-runner-core/test-helpers';
import { legacyPlugin } from '@web/dev-server-legacy';
import { resolve } from 'path';

export function runLocationChangeTest(
  config: Partial<TestRunnerCoreConfig> & { browsers: BrowserLauncher[] },
) {
  describe('location-change', async function () {
    const browserCount = config.browsers.length;
    let allSessions: TestSession[];

    before(async () => {
      const result = await runTests(
        {
          ...config,
          files: [
            ...(config.files ?? []),
            resolve(import.meta.dirname, 'browser-tests', '*.test.js'),
          ],
          plugins: [...(config.plugins ?? []), legacyPlugin()],
        },
        undefined,
        { allowFailure: true, reportErrors: false },
      );
      allSessions = result.sessions;

      assert.equal(
        allSessions.every(s => s.passed),
        false,
        'All sessions should have failed',
      );
    });

    it('handles tests which assign to window.location.href', () => {
      const sessions = allSessions.filter(s => s.testFile.endsWith('fail-location-href.test.js'));
      assert.equal(sessions.length === browserCount, true);
      for (const session of sessions) {
        assert.equal(session.testResults, undefined);
        assert.deepEqual(session.logs, []);
        assert.equal(session.errors.length, 1);
        assert.ok(
          session.errors[0].message.includes(
            'Tests were interrupted because the page navigated to',
          ),
        );
        assert.ok(
          session.errors[0].message.includes(
            'This can happen when clicking a link, submitting a form or interacting with window.location.',
          ),
        );
      }
    });

    it('handles tests which call window.location.reload()', () => {
      const sessions = allSessions.filter(s => s.testFile.endsWith('fail-location-reload.test.js'));
      assert.equal(sessions.length === browserCount, true);
      for (const session of sessions) {
        assert.equal(session.testResults, undefined);
        assert.deepEqual(session.logs, []);
        assert.deepEqual(session.errors, [
          {
            message:
              'Tests were interrupted because the page was reloaded. This can happen when clicking a link, submitting a form or interacting with window.location.',
          },
        ]);
      }
    });

    it('handles tests which call window.location.replace', () => {
      const sessions = allSessions.filter(s =>
        s.testFile.endsWith('fail-location-replace.test.js'),
      );
      assert.equal(sessions.length === browserCount, true);
      for (const session of sessions) {
        assert.equal(session.testResults, undefined);
        assert.deepEqual(session.logs, []);
        assert.equal(session.errors.length, 1);
        assert.ok(
          session.errors[0].message.includes(
            'Tests were interrupted because the page navigated to',
          ),
        );
        assert.ok(session.errors[0].message.includes('/new-page/'));
        assert.ok(
          session.errors[0].message.includes(
            'This can happen when clicking a link, submitting a form or interacting with window.location.',
          ),
        );
      }
    });
  });
}
