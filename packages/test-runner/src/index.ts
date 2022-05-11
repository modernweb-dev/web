import type { TestRunnerConfig as FullTestRunnerConfig } from './config/TestRunnerConfig';

export * from '@web/test-runner-core';
export { chromeLauncher } from '@web/test-runner-chrome';
export { defaultReporter, summaryReporter, dotReporter } from '@web/test-runner-reporters';

export { startTestRunner } from './startTestRunner';
export type TestRunnerConfig = Partial<FullTestRunnerConfig>;
