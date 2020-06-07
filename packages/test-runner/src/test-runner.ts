#!/usr/bin/env node
import { TestRunnerConfig } from '@web/test-runner-core';
import { startTestRunner } from '@web/test-runner-cli';
import { createDevServer } from '@web/test-runner-dev-server';
import { chromeLauncher } from '@web/test-runner-chrome';

const defaultConfig: Partial<TestRunnerConfig> = {
  testFrameworkImport: '@web/test-runner-mocha',
  browsers: chromeLauncher(),
  server: createDevServer(),
};

startTestRunner({ defaultConfig });
