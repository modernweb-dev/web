import assert from 'node:assert/strict';
import { describe, before, it } from 'node:test';
import type { BrowserLauncher, TestRunnerCoreConfig, TestSession } from '@web/test-runner-core';
import { runTests } from '@web/test-runner-core/test-helpers';
import { legacyPlugin } from '@web/dev-server-legacy';
import { resolve } from 'path';

export function runFocusTest(
  config: Partial<TestRunnerCoreConfig> & { browsers: BrowserLauncher[] },
) {
  describe.skip('focus', async function () {
    let allSessions: TestSession[];

    before(async () => {
      const result = await runTests({
        ...config,
        concurrency: 2,
        files: [...(config.files ?? []), resolve(import.meta.dirname, 'browser-tests', '*.test.js')],
        plugins: [...(config.plugins ?? []), legacyPlugin()],
      });
      allSessions = result.sessions;
    });

    it.skip('can run tests with focus, concurrently and sequentially', () => {
      assert.equal(allSessions.every(s => s.passed), true, 'All sessions should have passed');
    });
  });
}
