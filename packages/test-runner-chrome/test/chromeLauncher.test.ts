import { describe } from 'node:test';
import { runIntegrationTests } from '../../../integration/test-runner/index.ts';
import { chromeLauncher } from '../src/index.ts';

describe('test-runner-chrome', { timeout: 20000 }, () => {
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
