import { TestRunnerConfig } from '../runner/TestRunnerConfig.js';
import { TestSessionManager } from '../test-session/TestSessionManager.js';
import { TestRunner } from '../runner/TestRunner.js';

export interface ServerStartArgs {
  config: TestRunnerConfig;
  sessions: TestSessionManager;
  runner: TestRunner;
  testFiles: string[];
}

export interface Server {
  start(args: ServerStartArgs): Promise<void>;
  stop(): Promise<void>;
}
