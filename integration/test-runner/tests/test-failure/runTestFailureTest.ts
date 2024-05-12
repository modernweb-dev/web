import { BrowserLauncher, TestRunnerCoreConfig, TestSession } from '@web/test-runner-core';
import { runTests } from '@web/test-runner-core/test-helpers';
import { legacyPlugin } from '@web/dev-server-legacy';
import { resolve, sep } from 'path';
import { expect } from 'chai';

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
          files: [...(config.files ?? []), resolve(__dirname, 'browser-tests', '*.test.js')],
          plugins: [...(config.plugins ?? []), legacyPlugin()],
        },
        undefined,
        { allowFailure: true, reportErrors: false },
      );
      allSessions = result.sessions;

      expect(allSessions.every(s => s.passed)).to.equal(false, 'All sessions should have failed');
    });

    it('handles tests with 404 imports', () => {
      const sessions = allSessions.filter(s => s.testFile.endsWith('fail-404-import.test.js'));
      expect(sessions.length === browserCount).to.equal(true);
      for (const session of sessions) {
        expect(session.testResults!.suites.length).to.equal(0);
        expect(session.testResults!.tests.length).to.equal(0);
        expect(session.request404s).to.eql([
          'integration/test-runner/tests/test-failure/browser-tests/non-existing.js',
        ]);
        expect(session.errors).to.eql([ERROR_NOT_IMPORTABLE]);
        expect(session.logs.length).to.equal(1);
        expectFetchModuleFailed((session.logs[0] as any)[0]);
      }
    });

    it('handles tests that error with a circular reference', () => {
      const sessions = allSessions.filter(s => s.testFile.endsWith('fail-circular-error.test.js'));
      expect(sessions.length === browserCount).to.equal(true);
      for (const session of sessions) {
        expect(session.testResults!.tests.map(t => t.name)).to.eql(['bad predicate']);
        expect(session.passed).to.be.false;
        expect(session.testResults!.tests![0].error!.message).to.equal(
          "expected { x: 'x', circle: [Circular] } to equal null",
        );
      }
    });

    it('handles tests that throw in afterEach', () => {
      const sessions = allSessions.filter(s => s.testFile.endsWith('fail-after-each.test.js'));
      expect(sessions.length === browserCount).to.equal(true);
      for (const session of sessions) {
        expect(session.testResults!.tests.map(t => t.name)).to.eql([
          'true is true',
          'true is really true',
        ]);
        expect(session.errors.length).to.equal(1);
        expect(session.errors[0].message).to.include('error thrown in afterEach hook');
        expect(session.errors[0].stack).to.include(
          `test-failure${sep}browser-tests${sep}fail-after-each.test.js`,
        );
        expect(session.logs).to.eql([]);
      }
    });

    it('handles tests that throw in after', () => {
      const sessions = allSessions.filter(s => s.testFile.endsWith('fail-after.test.js'));
      expect(sessions.length === browserCount).to.equal(true);
      for (const session of sessions) {
        expect(session.testResults!.tests.map(t => t.name)).to.eql([
          'true is true',
          'true is really true',
        ]);
        expect(session.errors.length).to.equal(1);
        expect(session.errors[0].message).to.include('error thrown in after hook');

        expect(session.errors[0].stack).to.include(
          `test-failure${sep}browser-tests${sep}fail-after.test.js`,
        );
        expect(session.logs).to.eql([]);
      }
    });

    it('handles tests that throw in beforeEach', () => {
      const sessions = allSessions.filter(s => s.testFile.endsWith('fail-before-each.test.js'));
      expect(sessions.length === browserCount).to.equal(true);
      for (const session of sessions) {
        expect(session.testResults!.tests.map(t => t.name)).to.eql([
          'true is true',
          'true is really true',
        ]);
        expect(session.errors.length).to.equal(1);
        expect(session.errors[0].message).to.include('error thrown in beforeEach hook');

        expect(session.errors[0].stack).to.include(
          `test-failure${sep}browser-tests${sep}fail-before-each.test.js`,
        );
        expect(session.logs).to.eql([]);
      }
    });

    it('handles tests that throw in before', () => {
      const sessions = allSessions.filter(s => s.testFile.endsWith('fail-before.test.js'));
      expect(sessions.length === browserCount).to.equal(true);
      for (const session of sessions) {
        expect(session.testResults!.tests.map(t => t.name)).to.eql([
          'true is true',
          'true is really true',
        ]);
        expect(session.errors.length).to.equal(1);
        expect(session.errors[0].message).to.include('error thrown in before hook');

        expect(session.errors[0].stack).to.include(
          `test-failure${sep}browser-tests${sep}fail-before.test.js`,
        );
        expect(session.logs).to.eql([]);
      }
    });

    it('handles a custom thrown error', () => {
      const sessions = allSessions.filter(s => s.testFile.endsWith('fail-custom-error.test.js'));
      expect(sessions.length === browserCount).to.equal(true);
      for (const session of sessions) {
        expect(session.testResults!.tests.map(t => t.name)).to.eql(['custom error']);
        expect(session.testResults!.tests[0].error!.message).to.include('a custom error thrown');
        expect(session.testResults!.tests[0].error!.stack).to.include(
          `browser-tests${sep}fail-custom-error.test.js`,
        );
        expect(session.errors).to.eql([]);
        expect(session.logs).to.eql([]);
      }
    });

    it('handles an error executing a module', () => {
      const sessions = allSessions.filter(s =>
        s.testFile.endsWith('fail-error-module-exec.test.js'),
      );
      expect(sessions.length === browserCount).to.equal(true);
      for (const session of sessions) {
        expect(session.testResults!.suites.length).to.equal(0);
        expect(session.testResults!.tests.length).to.equal(0);
        expect(session.errors).to.eql([ERROR_NOT_IMPORTABLE]);
        expect(session.logs[0][0]).to.include('This is thrown before running tests');
      }
    });

    it('handles error stack traces correctly', () => {
      const sessions = allSessions.filter(s => s.testFile.endsWith('fail-stack-trace.test.js'));
      expect(sessions.length === browserCount).to.equal(true);
      for (const session of sessions) {
        expect(session.testResults!.tests.length).to.equal(1);
        expect(session.testResults!.tests[0]!.error!.message).to.include('My error');
        expect(session.testResults!.tests[0]!.error!.stack).to.include('throwErrorC');
        expect(session.testResults!.tests[0]!.error!.stack).to.include('fail-stack-trace-c.js');
        expect(session.errors).to.eql([]);
        expect(session.logs).to.eql([]);
      }
    });

    it('handles string diffs correctly', () => {
      const sessions = allSessions.filter(s => s.testFile.endsWith('fail-string-diff.test.js'));
      expect(sessions.length === browserCount).to.equal(true);
      for (const session of sessions) {
        expect(session.testResults!.tests[0]!.name).to.equal('string diff');
        expect(session.testResults!.tests[0]!.error!.message).to.include(
          "expected 'foo' to equal 'bar'",
        );
        expect(session.testResults!.tests[0]!.error!.expected).to.equal('bar');
        expect(session.testResults!.tests[0]!.error!.actual).to.equal('foo');
        expect(session.testResults!.tests.length).to.equal(1);
        expect(session.errors).to.eql([]);
        expect(session.logs).to.eql([]);
      }
    });

    it('handles syntax errors', () => {
      const sessions = allSessions.filter(s => s.testFile.endsWith('fail-syntax-error.test.js'));
      expect(sessions.length === browserCount).to.equal(true);
      for (const session of sessions) {
        expect(session.testResults!.suites.length).to.eql(0);
        expect(session.testResults!.tests.length).to.eql(0);
        expect(session.errors).to.eql([ERROR_NOT_IMPORTABLE]);
      }
    });

    it('handles tests that error with a readonly actual', () => {
      const sessions = allSessions.filter(s => s.testFile.endsWith('fail-readonly-actual.test.js'));
      expect(sessions.length === browserCount).to.equal(true);
      for (const session of sessions) {
        expect(session.testResults!.tests.map(t => t.name)).to.eql(['readonly actual']);
        expect(session.passed).to.be.false;
        expect(session.testResults!.tests![0].error!.message).to.equal(
          'expected { x: {} } to equal null',
        );
      }
    });
  });
}
