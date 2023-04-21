import { BrowserLauncher, TestRunnerCoreConfig } from '@web/test-runner-core';
import { runTests } from '@web/test-runner-core/test-helpers';
import { legacyPlugin } from '@web/dev-server-legacy';
import { resolve } from 'path';

export function runParallelTest(
  createConfig: () => Partial<TestRunnerCoreConfig> & { browsers: BrowserLauncher[] },
) {
  describe('parallel', async function () {
    it('can run tests in parallel', async () => {
      const configA = createConfig();
      const configB = createConfig();

      await Promise.all([
        runTests({
          ...configA,
          files: [...(configA.files ?? []), resolve(__dirname, 'browser-tests', '*.test.js')],
          plugins: [...(configA.plugins ?? []), legacyPlugin()],
        }),

        runTests({
          ...configB,
          files: [...(configB.files ?? []), resolve(__dirname, 'browser-tests', '*.test.js')],
          plugins: [...(configB.plugins ?? []), legacyPlugin()],
        }),
      ]);
    });
  });
}
