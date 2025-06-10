import { BrowserLauncher, TestRunnerCoreConfig, TestSession } from '@web/test-runner-core';
import { runTests } from '@web/test-runner-core/test-helpers';
import { legacyPlugin } from '@web/dev-server-legacy';
import { resolve } from 'path';
import { expect } from 'chai';

export function runBasicTest(
  config: Partial<TestRunnerCoreConfig> & { browsers: BrowserLauncher[] },
) {
  describe('basic', async function () {
    const browserCount = config.browsers.length;
    let allSessions: TestSession[];

    before(async () => {
      const result = await runTests({
        ...config,
        files: [...(config.files ?? []), resolve(__dirname, 'browser-tests', '*.test.js')],
        plugins: [...(config.plugins ?? []), legacyPlugin()],
      });
      allSessions = result.sessions;

      expect(allSessions.every(s => s.passed)).to.equal(true, 'All sessions should have passed');
    });

    it('passes basic test', () => {
      const sessions = allSessions.filter(s => s.testFile.endsWith('basic.test.js'));
      expect(sessions.length === browserCount).to.equal(
        true,
        'Each browser should run basic.test.js',
      );
      for (const session of sessions) {
        expect(session.testResults!.tests.length).to.equal(0);
        expect(session.testResults!.suites.length).to.equal(1);
        expect(session.testResults!.suites[0].tests.length).to.equal(1);
        expect(session.testResults!.suites[0].tests.map(t => t.name)).to.eql(['works']);
      }
    });

    it('passes js-syntax test', () => {
      const sessions = allSessions.filter(s => s.testFile.endsWith('js-syntax.test.js'));
      expect(sessions.length === browserCount).to.equal(
        true,
        'Each browser should run js-syntax.test.js',
      );
      for (const session of sessions) {
        expect(session.testResults!.tests.map(t => t.name)).to.eql([
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
      expect(sessions.length === browserCount).to.equal(
        true,
        'Each browser should run module-features.test.js',
      );
      for (const session of sessions) {
        expect(session.testResults!.tests.map(t => t.name)).to.eql([
          'supports static imports',
          'supports dynamic imports',
          'supports import meta',
        ]);
      }
    });

    it('passes timers test', () => {
      const sessions = allSessions.filter(s => s.testFile.endsWith('timers.test.js'));
      expect(sessions.length === browserCount).to.equal(
        true,
        'Each browser should run timers.test.js',
      );
      for (const session of sessions) {
        expect(session.testResults!.tests.length).to.equal(0);
        expect(session.testResults!.suites.length).to.equal(1);
        expect(session.testResults!.suites[0].tests.map(t => t.name)).to.eql([
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
