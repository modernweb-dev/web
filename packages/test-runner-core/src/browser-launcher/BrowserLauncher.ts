import { CoverageMapData } from 'istanbul-lib-coverage';
import { TestRunnerCoreConfig } from '../config/TestRunnerCoreConfig';
import { TestSession } from '../test-session/TestSession';

export interface Viewport {
  width: number;
  height: number;
}

export interface SessionResult {
  testCoverage?: CoverageMapData;
  browserLogs: any[][];
}

export interface BrowserLauncher {
  /**
   * One time startup for the browser launcher. Called when the test runner
   * starts.
   * @param config The test runner config.
   */
  start(config: TestRunnerCoreConfig, testFiles: string[]): Promise<string>;

  /**
   * One time teardown for the browser launcher. Called when the test runner
   * stops.
   */
  stop(): Promise<void>;

  /**
   * Start a single test sessions in a single browser page or tab. This should
   * open the browser for the given URL.
   *
   * This function can be called multiple times in parallel, implementations which cannot
   * handle opening browser pages in parallel should set up a queuing system.
   * @param session
   */
  startSession(session: TestSession, url: string): Promise<void>;

  /**
   * Returns whether this session is currently active. If it is active, stopSession
   * can be called.
   * @param session
   */
  isActive(session: TestSession): boolean;

  /**
   * Stops a single test session. There is no mandatory action to be taken here.
   * Implementations can use this for example to recycle inactive tabs instead of
   * creating new ones.
   * @param session
   */
  stopSession(session: TestSession): SessionResult | Promise<SessionResult>;

  /**
   * Starts a debug session. This should start a session like startSession, but
   * without headless. If the implementation does not support debugging,
   * it can throw an error.
   * @param session
   */
  startDebugSession(session: TestSession, url: string): Promise<void>;

  /**
   * Sets the viewport. Not all browser implementations support this.
   * @param viewport
   */
  setViewport(session: TestSession, viewport: Viewport): void | Promise<void>;
}
