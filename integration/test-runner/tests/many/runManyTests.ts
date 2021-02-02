import { BrowserLauncher, TestRunnerCoreConfig } from '@web/test-runner-core';
import { runTests } from '@web/test-runner-core/test-helpers';
import { legacyPlugin } from '@web/dev-server-legacy';
import { resolve } from 'path';

export function runManyTests(
  config: Partial<TestRunnerCoreConfig> & { browsers: BrowserLauncher[] },
) {
  describe('many', async function () {
    it('can run many test', async () => {
      await Promise.all([
        runTests({
          ...config,
          files: [...(config.files ?? []), resolve(__dirname, 'browser-tests', '*.test.js')],
          plugins: [...(config.plugins ?? []), legacyPlugin()],
        }),
      ]);
    });
  });
}
