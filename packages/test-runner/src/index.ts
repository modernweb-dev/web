import type { TestRunnerConfig as FullTestRunnerConfig } from './config/TestRunnerConfig.js';

export * from '@web/test-runner-core';
export { chromeLauncher } from '@web/test-runner-chrome';

export { startTestRunner } from './startTestRunner.js';
export { defaultReporter } from './reporter/defaultReporter.js';
export { summaryReporter } from './reporter/summaryReporter.js';
export { dotReporter } from './reporter/dotReporter.js';
export { formatError } from './reporter/reportTestsErrors.js';
export type TestRunnerConfig = Partial<FullTestRunnerConfig>;
