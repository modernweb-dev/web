import { describe } from 'node:test';
import { runIntegrationTests } from '../../../integration/test-runner/index.js';
import { chromeLauncher } from '../dist/index.js';

describe('test-runner-chrome', function testRunnerChrome() {

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
