import { TestRunnerConfig } from '../runner/TestRunnerConfig';
import { TestSession } from '../test-session/TestSession';

export interface BrowserLauncher {
  start(config: TestRunnerConfig): Promise<string[]>;
  stop(): Promise<void>;
  startDebugSession(session: TestSession): Promise<void>;
  startSession(session: TestSession): Promise<void>;
  stopSession(session: TestSession): void;
}
