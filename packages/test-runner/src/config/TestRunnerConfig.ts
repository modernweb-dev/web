import { TestRunnerCoreConfig, TestRunnerGroupConfig } from '@web/test-runner-core';
import { RollupNodeResolveOptions } from '@web/dev-server';

export interface TestRunnerConfig extends TestRunnerCoreConfig {
  groups?: string | string[] | TestRunnerGroupConfig[];
  nodeResolve?: boolean | RollupNodeResolveOptions;
  preserveSymlinks?: boolean;
  esbuildTarget?: string | string[];
}
