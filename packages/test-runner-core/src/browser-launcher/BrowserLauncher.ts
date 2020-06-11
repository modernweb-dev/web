import { TestRunnerConfig } from '../runner/TestRunnerConfig';
import { TestSession } from '../test-session/TestSession';

export interface BrowserLauncher {
  /**
   * One time startup for the browser launcher. Called when the test runner
   * starts.
   * @param config The test runner config.
   */
  start(config: TestRunnerConfig): Promise<string[]>;

  /**
   * One time teardown for the browser launcher. Called when the test runner
   * stops.
   */
  stop(): Promise<void>;

  /**
   * Start a single test sessions in a single browser page or tab. This should
   * open the browser with the test session id in the URL.
   * @param session
   */
  startSession(session: TestSession): Promise<void>;

  /**
   * Stops a single test session. There is no mandatory action to be taken here.
   * Implementations can use this for example to recycle inactive tabs instead of
   * creating new ones.
   * @param session
   */
  stopSession(session: TestSession): void;

  /**
   * Starts a debug session. This should start a session like startSession, but
   * without headless and with a debug parameter in the URL. If the implementation
   * does not support debugging, it can throw an error.
   * @param session
   */
  startDebugSession(session: TestSession): Promise<void>;
}
