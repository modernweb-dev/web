import type { TestRunnerConfig as FullTestRunnerConfig } from './config/TestRunnerConfig.ts';

export * from '@web/test-runner-core';
export { chromeLauncher } from '@web/test-runner-chrome';

export { startTestRunner } from './startTestRunner.ts';
export { defaultReporter } from './reporter/defaultReporter.ts';
export { summaryReporter } from './reporter/summaryReporter.ts';
export { dotReporter } from './reporter/dotReporter.ts';
export { formatError } from './reporter/reportTestsErrors.ts';
export type TestRunnerConfig = Partial<FullTestRunnerConfig>;
