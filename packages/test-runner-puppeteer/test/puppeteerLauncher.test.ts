import { runIntegrationTests } from '../../../integration/test-runner';
import { puppeteerLauncher } from '../src/index';

describe('test-runner-puppeteer', function testRunnerPuppeteer() {
  this.timeout(20000);

  runIntegrationTests(() => ({
    browsers: [puppeteerLauncher()],
  }));
});
