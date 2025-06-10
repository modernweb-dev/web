import { BrowserLauncher, TestRunnerCoreConfig, TestSession } from '@web/test-runner-core';
import { runTests } from '@web/test-runner-core/test-helpers';
import { legacyPlugin } from '@web/dev-server-legacy';
import { resolve } from 'path';
import { expect } from 'chai';

export function runFocusTest(
  config: Partial<TestRunnerCoreConfig> & { browsers: BrowserLauncher[] },
) {
  describe.skip('focus', async function () {
    let allSessions: TestSession[];

    before(async () => {
      const result = await runTests({
        ...config,
        // 2 means some are executed concurrently, and some sequentially
        concurrency: 2,
        files: [...(config.files ?? []), resolve(__dirname, 'browser-tests', '*.test.js')],
        plugins: [...(config.plugins ?? []), legacyPlugin()],
      });
      allSessions = result.sessions;
    });

    it.skip('can run tests with focus, concurrently and sequentially', () => {
      expect(allSessions.every(s => s.passed)).to.equal(true, 'All sessions should have passed');
    });
  });
}
