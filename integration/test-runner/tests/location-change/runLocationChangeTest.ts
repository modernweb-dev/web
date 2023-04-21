import { BrowserLauncher, TestRunnerCoreConfig, TestSession } from '@web/test-runner-core';
import { runTests } from '@web/test-runner-core/test-helpers';
import { legacyPlugin } from '@web/dev-server-legacy';
import { resolve } from 'path';
import { expect } from 'chai';

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
          files: [...(config.files ?? []), resolve(__dirname, 'browser-tests', '*.test.js')],
          plugins: [...(config.plugins ?? []), legacyPlugin()],
        },
        undefined,
        { allowFailure: true, reportErrors: false },
      );
      allSessions = result.sessions;

      expect(allSessions.every(s => s.passed)).to.equal(false, 'All sessions should have failed');
    });

    it('handles tests which assign to window.location.href', () => {
      const sessions = allSessions.filter(s => s.testFile.endsWith('fail-location-href.test.js'));
      expect(sessions.length === browserCount).to.equal(true);
      for (const session of sessions) {
        expect(session.testResults).to.equal(undefined);
        expect(session.logs).to.eql([]);
        expect(session.errors.length).to.equal(1);
        expect(session.errors[0].message).to.include(
          'Tests were interrupted because the page navigated to',
        );
        expect(session.errors[0].message).to.include(
          'This can happen when clicking a link, submitting a form or interacting with window.location.',
        );
      }
    });

    it('handles tests which call window.location.reload()', () => {
      const sessions = allSessions.filter(s => s.testFile.endsWith('fail-location-reload.test.js'));
      expect(sessions.length === browserCount).to.equal(true);
      for (const session of sessions) {
        expect(session.testResults).to.equal(undefined);
        expect(session.logs).to.eql([]);
        expect(session.errors).to.eql([
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
      expect(sessions.length === browserCount).to.equal(true);
      for (const session of sessions) {
        expect(session.testResults).to.equal(undefined);
        expect(session.logs).to.eql([]);
        expect(session.errors.length).to.equal(1);
        expect(session.errors[0].message).to.include(
          'Tests were interrupted because the page navigated to',
        );
        expect(session.errors[0].message).to.include('/new-page/');
        expect(session.errors[0].message).to.include(
          'This can happen when clicking a link, submitting a form or interacting with window.location.',
        );
      }
    });
  });
}
