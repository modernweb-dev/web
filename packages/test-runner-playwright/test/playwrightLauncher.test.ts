import os from 'os';
import { runIntegrationTests } from '../../../integration/test-runner';
import { playwrightLauncher } from '../src/index';

describe('test-runner-playwright chromium', function testRunnerPlaywright() {
  this.timeout(100000);

  runIntegrationTests(() => ({
    browsers: [playwrightLauncher({ product: 'chromium' })],
  }));
});

// we don't run all tests in the windows CI
if (os.platform() !== 'win32') {
  describe('test-runner-playwright webkit', function testRunnerPlaywright() {
    this.timeout(100000);

    runIntegrationTests(() => ({
      browsers: [playwrightLauncher({ product: 'webkit' })],
    }));
  });

  describe('test-runner-playwright firefox', function testRunnerPlaywright() {
    this.timeout(100000);

    runIntegrationTests(
      () => ({
        browsers: [playwrightLauncher({ product: 'firefox' })],
      }),
      {
        // firefox doesn't like parallel in the CI
        parallel: false,
      },
    );
  });

  describe('test-runner-playwright all', function testRunnerPlaywright() {
    this.timeout(100000);

    runIntegrationTests(
      () => ({
        browsers: [
          playwrightLauncher({ product: 'chromium' }),
          playwrightLauncher({ product: 'firefox' }),
          ...(os.platform() !== 'win32' ? [playwrightLauncher({ product: 'webkit' })] : []),
        ],
      }),
      { parallel: false, testFailure: false, locationChanged: false },
    );
  });
}
