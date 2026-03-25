import { describe } from 'node:test';
import { runIntegrationTests } from '../../../integration/test-runner/index.ts';
import { puppeteerLauncher } from '../src/index.ts';

describe('test-runner-puppeteer', { timeout: 20000 }, () => {
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
