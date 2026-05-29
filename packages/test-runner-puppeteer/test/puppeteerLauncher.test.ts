import { runIntegrationTests } from '../../../integration/test-runner/index.js';
import { puppeteerLauncher } from '../src/index.js';

describe('test-runner-puppeteer', function testRunnerPuppeteer() {
  this.timeout(20000);

  function createConfig() {
    return {
      browsers: [puppeteerLauncher()],
    };
  }

  runIntegrationTests(createConfig, {
    basic: true,
    many: true,
    focus: true,
    groups: true,
    parallel: true,
    testFailure: true,
    locationChanged: true,
  });
});
