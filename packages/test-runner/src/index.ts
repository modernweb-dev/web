import type { TestRunnerConfig as FullTestRunnerConfig } from './config/TestRunnerConfig.js';

export { chromeLauncher } from '@web/test-runner-chrome';
export * from '@web/test-runner-core';
export { defaultReporter } from './reporter/defaultReporter.js';
export { dotReporter } from './reporter/dotReporter.js';
export { formatError } from './reporter/reportTestsErrors.js';
export { summaryReporter } from './reporter/summaryReporter.js';
export { startTestRunner } from './startTestRunner.js';

export type TestRunnerConfig = Partial<FullTestRunnerConfig>;
