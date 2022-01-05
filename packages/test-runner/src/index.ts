import type { TestRunnerConfig as FullTestRunnerConfig } from './config/TestRunnerConfig';

export * from '@web/test-runner-core';
export { chromeLauncher } from '@web/test-runner-chrome';

export { startTestRunner } from './startTestRunner';
export { defaultReporter } from './reporter/defaultReporter';
export { summaryReporter } from './reporter/summaryReporter';
export { dotReporter } from './reporter/dotReporter';
export type TestRunnerConfig = Partial<FullTestRunnerConfig>;
