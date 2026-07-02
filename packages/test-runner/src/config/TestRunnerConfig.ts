import { type RollupNodeResolveOptions } from '@web/dev-server';
import {
  type TestFramework,
  type TestRunnerCoreConfig,
  type TestRunnerGroupConfig,
} from '@web/test-runner-core';

export interface TestRunnerConfig extends Omit<TestRunnerCoreConfig, 'testFramework'> {
  groups?: string | string[] | TestRunnerGroupConfig[];
  nodeResolve?: boolean | RollupNodeResolveOptions;
  preserveSymlinks?: boolean;
  esbuildTarget?: string | string[];
  testFramework?: Partial<TestFramework>;
}
