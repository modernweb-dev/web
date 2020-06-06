#!/usr/bin/env node
import { TestRunnerConfig } from '@web/test-runner-core';
import { startTestRunner } from '@web/test-runner-cli';
import { createDevServer } from '@web/test-runner-dev-server';
import { puppeteerLauncher } from '@web/test-runner-puppeteer';

const defaultConfig: Partial<TestRunnerConfig> = {
  testFrameworkImport: '@web/test-runner-mocha',
  browsers: puppeteerLauncher(),
  server: createDevServer(),
};

startTestRunner({ defaultConfig });
