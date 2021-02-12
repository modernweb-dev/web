import { runIntegrationTests } from '../../../integration/test-runner';
import { browserstackLauncher } from '../src/index';

if (!process.env.BROWSER_STACK_USERNAME) {
  throw new Error('Missing env var BROWSER_STACK_USERNAME');
}

if (!process.env.BROWSER_STACK_ACCESS_KEY) {
  throw new Error('Missing env var BROWSER_STACK_ACCESS_KEY');
}

const sharedCapabilities = {
  'browserstack.user': process.env.BROWSER_STACK_USERNAME,
  'browserstack.key': process.env.BROWSER_STACK_ACCESS_KEY,

  project: '@web/test-runner-browserstack',
  name: 'integration test',
  build: `modern-web ${process.env.GITHUB_REF ?? 'local'} build ${
    process.env.GITHUB_RUN_NUMBER ?? ''
  }`,
};

describe('test-runner-browserstack', function () {
  this.timeout(200000);

  function createConfig() {
    return {
      browserStartTimeout: 1000 * 60 * 2,
      testsStartTimeout: 1000 * 60 * 2,
      testsFinishTimeout: 1000 * 60 * 2,
      browsers: [
        browserstackLauncher({
          capabilities: {
            ...sharedCapabilities,
            browserName: 'Chrome',
            browser_version: 'latest',
            os: 'windows',
            os_version: '10',
          },
        }),
        // browserstackLauncher({
        //   capabilities: {
        //     ...sharedCapabilities,
        //     browserName: 'Firefox',
        //     browser_version: 'latest',
        //     os: 'windows',
        //     os_version: '10',
        //   },
        // }),
        browserstackLauncher({
          capabilities: {
            ...sharedCapabilities,
            browserName: 'IE',
            browser_version: '11.0',
            os: 'Windows',
            os_version: '7',
          },
        }),
      ],
    };
  }

  runIntegrationTests(createConfig, {
    basic: true,
    many: true,
    focus: true,
    groups: false,
    parallel: false,
    testFailure: false,
    locationChanged: false,
  });
});
