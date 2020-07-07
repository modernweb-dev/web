import { TestRunnerCoreConfig } from '../runner/TestRunnerCoreConfig.js';
import { TestSessionManager } from '../test-session/TestSessionManager.js';
import { TestRunner } from '../runner/TestRunner.js';

export interface ServerStartArgs {
  config: TestRunnerCoreConfig;
  sessions: TestSessionManager;
  runner: TestRunner;
  testFiles: string[];
}

export interface Server {
  start(args: ServerStartArgs): Promise<void>;
  stop(): Promise<void>;
}
