import { describe } from 'node:test';
import { runIntegrationTests } from '../../../integration/test-runner/index.js';
import { puppeteerLauncher } from '../dist/index.js';

describe('test-runner-puppeteer', function testRunnerPuppeteer() {
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
