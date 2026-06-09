import assert from 'node:assert/strict';
import { describe, before, it } from 'node:test';
import type { BrowserLauncher, TestRunnerCoreConfig, TestSession } from '@web/test-runner-core';
import { runTests } from '@web/test-runner-core/test-helpers';
import { legacyPlugin } from '@web/dev-server-legacy';
import { resolve, sep } from 'path';

function expectIncludes(actual: string, expected: string) {
  if (!actual.includes(expected)) {
    throw new Error(
      `Expected substring not found.\n\nExpected:\n${expected}\n\nActual:\n${actual}`,
    );
  }
}

const ERROR_NOT_IMPORTABLE = {
  message:
    'Could not import your test module. Check the browser logs or open the browser in debug mode for more information.',
};
const FAILED_TO_FETCH_MESSAGES = [
  // chromium
  'Failed to fetch dynamically imported module',
  // firefox
  'error loading dynamically imported module',
  // safari
  'Importing a module script failed',
];

function expectFetchModuleFailed(msg: string) {
  if (!FAILED_TO_FETCH_MESSAGES.some(m => msg.includes(m))) {
    throw new Error(`Expected a failed to fetch module message, but got error message: ${msg}`);
  }
}

export function runTestFailureTest(
  config: Partial<TestRunnerCoreConfig> & { browsers: BrowserLauncher[] },
) {
  describe('test-failure', async function () {
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

    it('handles tests with 404 imports', () => {
      const sessions = allSessions.filter(s => s.testFile.endsWith('fail-404-import.test.js'));
      assert.equal(sessions.length === browserCount, true);
      for (const session of sessions) {
        assert.equal(session.testResults!.suites.length, 0);
        assert.equal(session.testResults!.tests.length, 0);
        assert.deepEqual(session.request404s, [
          'integration/test-runner/tests/test-failure/browser-tests/non-existing.js',
        ]);
        assert.deepEqual(session.errors, [ERROR_NOT_IMPORTABLE]);
        assert.equal(session.logs.length, 1);
        expectFetchModuleFailed((session.logs[0] as any)[0]);
      }
    });

    it('handles tests that error with a circular reference', () => {
      const sessions = allSessions.filter(s => s.testFile.endsWith('fail-circular-error.test.js'));
      assert.equal(sessions.length === browserCount, true);
      for (const session of sessions) {
        assert.deepEqual(
          session.testResults!.tests.map(t => t.name),
          ['bad predicate'],
        );
        assert.equal(session.passed, false);
        assert.equal(
          session.testResults!.tests![0].error!.message,
          "expected { x: 'x', circle: [Circular] } to equal null",
        );
      }
    });

    it('handles tests that throw in afterEach', () => {
      const sessions = allSessions.filter(s => s.testFile.endsWith('fail-after-each.test.js'));
      assert.equal(sessions.length === browserCount, true);
      for (const session of sessions) {
        assert.deepEqual(
          session.testResults!.tests.map(t => t.name),
          ['true is true', 'true is really true'],
        );
        assert.equal(session.errors.length, 1);
        expectIncludes(session.errors[0].message, 'error thrown in afterEach hook');
        assert.ok(
          session.errors[0].stack!.includes(
            `test-failure${sep}browser-tests${sep}fail-after-each.test.js`,
          ),
        );
        assert.deepEqual(session.logs, []);
      }
    });

    it('handles tests that throw in after', () => {
      const sessions = allSessions.filter(s => s.testFile.endsWith('fail-after.test.js'));
      assert.equal(sessions.length === browserCount, true);
      for (const session of sessions) {
        assert.deepEqual(
          session.testResults!.tests.map(t => t.name),
          ['true is true', 'true is really true'],
        );
        assert.equal(session.errors.length, 1);
        expectIncludes(session.errors[0].message, 'error thrown in after hook');
        assert.ok(
          session.errors[0].stack!.includes(
            `test-failure${sep}browser-tests${sep}fail-after.test.js`,
          ),
        );
        assert.deepEqual(session.logs, []);
      }
    });

    it('handles tests that throw in beforeEach', () => {
      const sessions = allSessions.filter(s => s.testFile.endsWith('fail-before-each.test.js'));
      assert.equal(sessions.length === browserCount, true);
      for (const session of sessions) {
        assert.deepEqual(
          session.testResults!.tests.map(t => t.name),
          ['true is true', 'true is really true'],
        );
        assert.equal(session.errors.length, 1);
        expectIncludes(session.errors[0].message, 'error thrown in beforeEach hook');
        assert.ok(
          session.errors[0].stack!.includes(
            `test-failure${sep}browser-tests${sep}fail-before-each.test.js`,
          ),
        );
        assert.deepEqual(session.logs, []);
      }
    });

    it('handles tests that throw in before', () => {
      const sessions = allSessions.filter(s => s.testFile.endsWith('fail-before.test.js'));
      assert.equal(sessions.length === browserCount, true);
      for (const session of sessions) {
        assert.deepEqual(
          session.testResults!.tests.map(t => t.name),
          ['true is true', 'true is really true'],
        );
        assert.equal(session.errors.length, 1);
        expectIncludes(session.errors[0].message, 'error thrown in before hook');
        assert.ok(
          session.errors[0].stack!.includes(
            `test-failure${sep}browser-tests${sep}fail-before.test.js`,
          ),
        );
        assert.deepEqual(session.logs, []);
      }
    });

    it('handles a custom thrown error', () => {
      const sessions = allSessions.filter(s => s.testFile.endsWith('fail-custom-error.test.js'));
      assert.equal(sessions.length === browserCount, true);
      for (const session of sessions) {
        assert.deepEqual(
          session.testResults!.tests.map(t => t.name),
          ['custom error'],
        );
        expectIncludes(session.testResults!.tests[0].error!.message, 'a custom error thrown');
        assert.ok(
          session.testResults!.tests[0].error!.stack!.includes(
            `browser-tests${sep}fail-custom-error.test.js`,
          ),
        );
        assert.deepEqual(session.errors, []);
        assert.deepEqual(session.logs, []);
      }
    });

    it('handles an error executing a module', () => {
      const sessions = allSessions.filter(s =>
        s.testFile.endsWith('fail-error-module-exec.test.js'),
      );
      assert.equal(sessions.length === browserCount, true);
      for (const session of sessions) {
        assert.equal(session.testResults!.suites.length, 0);
        assert.equal(session.testResults!.tests.length, 0);
        assert.deepEqual(session.errors, [ERROR_NOT_IMPORTABLE]);
        expectIncludes(session.logs[0][0] as string, 'This is thrown before running tests');
      }
    });

    it('handles error stack traces correctly', () => {
      const sessions = allSessions.filter(s => s.testFile.endsWith('fail-stack-trace.test.js'));
      assert.equal(sessions.length === browserCount, true);
      for (const session of sessions) {
        assert.equal(session.testResults!.tests.length, 1);
        expectIncludes(session.testResults!.tests[0]!.error!.message, 'My error');
        expectIncludes(session.testResults!.tests[0]!.error!.stack!, 'throwErrorC');
        expectIncludes(session.testResults!.tests[0]!.error!.stack!, 'fail-stack-trace-c.js');
        assert.deepEqual(session.errors, []);
        assert.deepEqual(session.logs, []);
      }
    });

    it('handles string diffs correctly', () => {
      const sessions = allSessions.filter(s => s.testFile.endsWith('fail-string-diff.test.js'));
      assert.equal(sessions.length === browserCount, true);
      for (const session of sessions) {
        assert.equal(session.testResults!.tests[0]!.name, 'string diff');
        assert.ok(
          session.testResults!.tests[0]!.error!.message.includes("expected 'foo' to equal 'bar'"),
        );
        assert.equal(session.testResults!.tests[0]!.error!.expected, 'bar');
        assert.equal(session.testResults!.tests[0]!.error!.actual, 'foo');
        assert.equal(session.testResults!.tests.length, 1);
        assert.deepEqual(session.errors, []);
        assert.deepEqual(session.logs, []);
      }
    });

    it('handles syntax errors', () => {
      const sessions = allSessions.filter(s => s.testFile.endsWith('fail-syntax-error.test.js'));
      assert.equal(sessions.length === browserCount, true);
      for (const session of sessions) {
        assert.equal(session.testResults!.suites.length, 0);
        assert.equal(session.testResults!.tests.length, 0);
        assert.deepEqual(session.errors, [ERROR_NOT_IMPORTABLE]);
      }
    });

    it('handles tests that error with a readonly actual', () => {
      const sessions = allSessions.filter(s => s.testFile.endsWith('fail-readonly-actual.test.js'));
      assert.equal(sessions.length === browserCount, true);
      for (const session of sessions) {
        assert.deepEqual(
          session.testResults!.tests.map(t => t.name),
          ['readonly actual'],
        );
        assert.equal(session.passed, false);
        assert.equal(
          session.testResults!.tests![0].error!.message,
          'expected { x: {} } to equal null',
        );
      }
    });
  });
}
