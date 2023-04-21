import { CoverageMapData } from 'istanbul-lib-coverage';
import { TestRunnerCoreConfig } from '../config/TestRunnerCoreConfig';
import { TestResultError } from '../test-session/TestSession';

export interface SessionResult {
  testCoverage?: CoverageMapData;
  errors?: TestResultError[];
  browserLogs?: any[][];
}

export interface BrowserLauncher {
  /**
   * A human friendly name to identify this browser. Doesn't need to be unique.
   */
  name: string;
  /**
   * A unique identifier for the type of browser launcher.
   */
  type: string;

  /**
   * Optional concurrency for this browser launcher only. Overwrites a globally
   * configured concurrency option.
   */
  concurrency?: number;

  __experimentalWindowFocus__?: boolean;

  /**
   * One time startup for the browser launcher. Called when the test runner
   * starts. Use this for async initialization work.
   * @param config
   */
  initialize?(config: TestRunnerCoreConfig, testFiles: string[]): void | Promise<void>;

  /**
   * Called after running tests when not in watch mode. Called when the test runner
   * shuts down when in watch mode.
   */
  stop?(): Promise<void>;

  /**
   * Start a single test sessions in a single browser page or tab. This should
   * open the browser for the given URL.
   *
   * This function can be called multiple times in parallel, implementations which cannot
   * handle opening browser pages in parallel should set up a queuing system.
   * @param session
   */
  startSession(sessionId: string, url: string): Promise<void>;

  /**
   * Returns whether this session is currently active. If it is active, stopSession
   * can be called.
   * @param session
   */
  isActive(sessionId: string): boolean;

  /**
   * Returns the current browser URL for the test session. This is used for example to
   * detect browser navigations.
   */
  getBrowserUrl(sessionId: string): string | undefined | Promise<string | undefined>;

  /**
   * Stops a single test session. There is no mandatory action to be taken here.
   * Implementations can use this for example to recycle inactive tabs instead of
   * creating new ones.
   * @param session
   */
  stopSession(sessionId: string): Promise<SessionResult>;

  /**
   * Starts a debug session. This should start a session like startSession, but
   * without headless. If the implementation does not support debugging,
   * it can throw an error.
   * @param session
   */
  startDebugSession(sessionId: string, url: string): Promise<void>;
}
