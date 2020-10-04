import { runIntegrationTests } from '../../../integration/test-runner';
import { chromeLauncher } from '../src/index';

describe('test-runner-chrome', function testRunnerChrome() {
  this.timeout(20000);

  runIntegrationTests(() => ({
    browsers: [chromeLauncher()],
  }));
});
