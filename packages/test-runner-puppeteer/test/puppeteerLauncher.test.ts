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
    many: true,
    // Focus tests are failing because of a puppeteer/chrome bug.
    // See https://github.com/puppeteer/puppeteer/issues/10350 and 
    // https://bugs.chromium.org/p/chromium/issues/detail?id=1454012
    focus: false,
    groups: true,
    parallel: true,
    testFailure: true,
    locationChanged: true,
  });
});
