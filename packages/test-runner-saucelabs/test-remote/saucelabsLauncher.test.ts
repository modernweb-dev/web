import { runIntegrationTests } from '../../../integration/test-runner';
import { createSauceLabsLauncher } from '../src/index';

if (!process.env.SAUCE_USERNAME) {
  throw new Error('Missing env var SAUCE_USERNAME');
}

if (!process.env.SAUCE_ACCESS_KEY) {
  throw new Error('Missing env var SAUCE_ACCESS_KEY');
}

const sauceLabsLauncher = createSauceLabsLauncher({
  user: process.env.SAUCE_USERNAME,
  key: process.env.SAUCE_ACCESS_KEY,
  region: 'eu',
});

const sharedCapabilities = {
  'sauce:options': {
    build: `modern-web ${process.env.GITHUB_REF ?? 'local'} build ${
      process.env.GITHUB_RUN_NUMBER ?? ''
    }`,
    name: 'integration test',
  },
};

describe('test-runner-saucelabs', function () {
  this.timeout(200000);

  function createConfig() {
    return {
      browserStartTimeout: 1000 * 60 * 2,
      testsStartTimeout: 1000 * 60 * 2,
      testsFinishTimeout: 1000 * 60 * 2,
      browsers: [
        sauceLabsLauncher({
          ...sharedCapabilities,
          browserName: 'chrome',
          browserVersion: 'latest',
          platformName: 'Windows 10',
        }),
        // sauceLabsLauncher({
        //   ...sharedCapabilities,
        //   browserName: 'safari',
        //   browserVersion: 'latest',
        //   platformName: 'macOS 10.15',
        // }),
        sauceLabsLauncher({
          ...sharedCapabilities,
          browserName: 'internet explorer',
          browserVersion: '11.0',
          platformName: 'Windows 7',
        }),
      ],
    };
  }

  runIntegrationTests(createConfig, {
    basic: true,
    groups: false,
    parallel: false,
    testFailure: false,
    locationChanged: false,
  });
});
