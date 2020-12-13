import type { TestRunnerConfig as FullTestRunnerConfig } from './config/TestRunnerConfig';

export * from '@web/test-runner-core';
export { chromeLauncher } from '@web/test-runner-chrome';

export { startTestRunner } from './startTestRunner';
export { defaultReporter } from './reporter/defaultReporter';
export type TestRunnerConfig = FullTestRunnerConfig;
