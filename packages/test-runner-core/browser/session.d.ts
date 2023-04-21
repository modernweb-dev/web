import { TestSession, TestResultError, TestSuiteResult, TestResult } from '../dist/index';

export interface RuntimeConfig {
  testFile: string;
  watch: boolean;
  debug: boolean;
  testFrameworkConfig?: unknown;
}

export type BrowserSessionResult = Pick<TestSession, 'passed' | 'errors' | 'testResults'>;

export interface FullBrowserSessionResult extends BrowserSessionResult {
  userAgent: string;
  logs: string[];
}

/**
 * @returns the config for this test session
 */
export function getConfig(): Promise<RuntimeConfig>;

/**
 * Indicate that the test session failed
 * @param error the reason why the session failed
 */
export function sessionFailed(error: TestResultError): Promise<void>;

/**
 * Indicate that the test session started, this is to track timeouts
 * starting the browser.
 */
export function sessionStarted(): Promise<void>;

/**
 * Indicate that the test session finished.
 * @param result the test results
 */
export function sessionFinished(result: BrowserSessionResult): Promise<void>;

export { TestSession, TestResultError, TestSuiteResult, TestResult };
