import { BrowserLauncher, TestRunnerCoreConfig } from '@web/test-runner-core';
import { runTests } from '@web/test-runner-core/dist/test-helpers.js';
import { legacyPlugin } from '@web/dev-server-legacy';
import { resolve } from 'path';
import { fileURLToPath } from 'node:url';

const dirname = fileURLToPath(new URL('.', import.meta.url));

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
          files: [...(configA.files ?? []), resolve(dirname, 'browser-tests', '*.test.js')],
          plugins: [...(configA.plugins ?? []), legacyPlugin()],
        }),

        runTests({
          ...configB,
          files: [...(configB.files ?? []), resolve(dirname, 'browser-tests', '*.test.js')],
          plugins: [...(configB.plugins ?? []), legacyPlugin()],
        }),
      ]);
    });
  });
}
