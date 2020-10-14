import { runIntegrationTests } from '../../../integration/test-runner';
import { puppeteerLauncher } from '../src/index';

describe('test-runner-puppeteer', function testRunnerPuppeteer() {
  this.timeout(20000);

  function createConfig() {
    return {
      browsers: [puppeteerLauncher()],
    };
  }

  runIntegrationTests(createConfig, {
    basic: true,
    groups: true,
    parallel: true,
    testFailure: true,
    locationChanged: true,
  });
});
