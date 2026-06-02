import assert from 'node:assert/strict';
import { describe, before, it } from 'node:test';
import type { BrowserLauncher, TestRunnerCoreConfig, TestSession } from '@web/test-runner-core';
import { runTests } from '@web/test-runner-core/test-helpers';
import { legacyPlugin } from '@web/dev-server-legacy';
import { resolve } from 'path';

export function runBasicTest(
  config: Partial<TestRunnerCoreConfig> & { browsers: BrowserLauncher[] },
) {
  describe('basic', async function () {
    const browserCount = config.browsers.length;
    let allSessions: TestSession[];

    before(async () => {
      const result = await runTests({
        ...config,
        files: [...(config.files ?? []), resolve(import.meta.dirname, 'browser-tests', '*.test.js')],
        plugins: [...(config.plugins ?? []), legacyPlugin()],
      });
      allSessions = result.sessions;

      assert.equal(allSessions.every(s => s.passed), true, 'All sessions should have passed');
    });

    it('passes basic test', () => {
      const sessions = allSessions.filter(s => s.testFile.endsWith('basic.test.js'));
      assert.equal(sessions.length === browserCount, true, 'Each browser should run basic.test.js');
      for (const session of sessions) {
        assert.equal(session.testResults!.tests.length, 0);
        assert.equal(session.testResults!.suites.length, 1);
        assert.equal(session.testResults!.suites[0].tests.length, 1);
        assert.deepEqual(session.testResults!.suites[0].tests.map(t => t.name), ['works']);
      }
    });

    it('passes js-syntax test', () => {
      const sessions = allSessions.filter(s => s.testFile.endsWith('js-syntax.test.js'));
      assert.equal(
        sessions.length === browserCount,
        true,
        'Each browser should run js-syntax.test.js',
      );
      for (const session of sessions) {
        assert.deepEqual(session.testResults!.tests.map(t => t.name), [
          'supports object spread',
          'supports async functions',
          'supports exponentiation',
          'supports classes',
          'supports template literals',
          'supports optional chaining',
          'supports nullish coalescing',
        ]);
      }
    });

    it('passes module-features test', () => {
      const sessions = allSessions.filter(s => s.testFile.endsWith('module-features.test.js'));
      assert.equal(
        sessions.length === browserCount,
        true,
        'Each browser should run module-features.test.js',
      );
      for (const session of sessions) {
        assert.deepEqual(session.testResults!.tests.map(t => t.name), [
          'supports static imports',
          'supports dynamic imports',
          'supports import meta',
        ]);
      }
    });

    it('passes timers test', () => {
      const sessions = allSessions.filter(s => s.testFile.endsWith('timers.test.js'));
      assert.equal(
        sessions.length === browserCount,
        true,
        'Each browser should run timers.test.js',
      );
      for (const session of sessions) {
        assert.equal(session.testResults!.tests.length, 0);
        assert.equal(session.testResults!.suites.length, 1);
        assert.deepEqual(session.testResults!.suites[0].tests.map(t => t.name), [
          'can call setTimeout',
          'can cancel setTimeout',
          'can call and cancel setInterval',
          'can call requestAnimationFrame',
          'can cancel requestAnimationFrame',
        ]);
      }
    });
  });
}
