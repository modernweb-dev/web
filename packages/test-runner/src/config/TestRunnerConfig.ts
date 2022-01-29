import { TestFramework, TestRunnerCoreConfig, TestRunnerGroupConfig } from '@web/test-runner-core';
import { RollupNodeResolveOptions } from '@web/dev-server';
import { SnapshotPluginConfig } from '@web/test-runner-commands/plugins.js';

export interface TestRunnerConfig extends Omit<TestRunnerCoreConfig, 'testFramework'> {
  groups?: string | string[] | TestRunnerGroupConfig[];
  nodeResolve?: boolean | RollupNodeResolveOptions;
  preserveSymlinks?: boolean;
  esbuildTarget?: string | string[];
  testFramework?: Partial<TestFramework>;
  snapshotConfig?: SnapshotPluginConfig;
}
