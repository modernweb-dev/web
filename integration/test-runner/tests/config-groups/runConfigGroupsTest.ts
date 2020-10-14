import {
  BrowserLauncher,
  TestRunnerCoreConfig,
  TestRunnerGroupConfig,
} from '@web/test-runner-core';
import { runTests } from '@web/test-runner-core/test-helpers';
import { legacyPlugin } from '@web/dev-server-legacy';
import { resolve } from 'path';
import { expect } from 'chai';

export function runConfigGroupsTest(
  config: Partial<TestRunnerCoreConfig> & { browsers: BrowserLauncher[] },
) {
  describe('groups', async function () {
    it('can create a test runner html per group', async () => {
      const groupConfigs: TestRunnerGroupConfig[] = [
        {
          name: 'a',
          testRunnerHtml: path =>
            `<html><body><script>window.__group__ = "a";</script><script type="module" src=${path}></script></body></html>`,
          files: [resolve(__dirname, 'browser-tests', 'test-runner-html-a.test.js')],
        },
        {
          name: 'b',
          testRunnerHtml: path =>
            `<html><body><script>window.__group__ = "b";</script><script type="module" src=${path}></script></body></html>`,
          files: [resolve(__dirname, 'browser-tests', 'test-runner-html-b.test.js')],
        },
      ];
      const result = await runTests(
        {
          ...config,
          plugins: [...(config.plugins ?? []), legacyPlugin()],
        },
        groupConfigs,
      );

      expect(result.sessions.every(s => s.passed)).to.equal(
        true,
        'All sessions should have passed',
      );
    });
  });
}
