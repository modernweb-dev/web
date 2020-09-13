import { TestRunnerCoreConfig } from '@web/test-runner-core';
import { chromeLauncher } from '@web/test-runner-chrome';
import { resolve } from 'path';
import { startTestRunner } from '../src/startTestRunner';
import { readConfig } from '../src/config/readConfig';

describe('startTestRunner', () => {
  it('starts the test runner', async () => {
    let resolveTest: () => void;
    const config = await readConfig();
    const testRunner = await startTestRunner(
      {
        ...config,
        files: [resolve(__dirname, 'fixtures', 'a.js').replace(/\\/g, '/')],
        testFramework: {
          path: require.resolve('@web/test-runner-mocha/dist/autorun.js'),
        },
        reporters: [],
        browsers: [chromeLauncher()],
        concurrency: 3,
      } as TestRunnerCoreConfig,
      [],
      { autoExitProcess: false },
    );

    testRunner.on('stopped', passed => {
      if (!passed) {
        throw new Error('Tests run did not pas');
      }
      resolveTest();
    });

    return new Promise(resolve => {
      resolveTest = resolve;
    });
  });
});
