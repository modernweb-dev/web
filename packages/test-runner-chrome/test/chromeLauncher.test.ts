import { runIntegrationTests } from '../../../integration/test-runner';
import { chromeLauncher } from '../src/index';

describe('test-runner-chrome', function testRunnerChrome() {
  this.timeout(20000);

  function createConfig() {
    return {
      browsers: [chromeLauncher()],
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
