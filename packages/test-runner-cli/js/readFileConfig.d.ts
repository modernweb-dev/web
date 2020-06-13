import { TestRunnerConfig } from '@web/test-runner-core';

export function readFileConfig(path?: string): Promise<Partial<TestRunnerConfig>>;
