import type { CoverageMapData } from 'istanbul-lib-coverage';
import { TestSessionStatus } from './TestSessionStatus.ts';
import { BasicTestSession } from './BasicTestSession.ts';

export interface TestResultError {
  message: string;
  name?: string;
  stack?: string;
  expected?: string;
  actual?: string;
}

export interface TestSuiteResult {
  name: string;
  suites: TestSuiteResult[];
  tests: TestResult[];
}

export interface TestResult {
  name: string;
  passed: boolean;
  skipped: boolean;
  duration?: number;
  error?: TestResultError;
}

export interface TestSession extends BasicTestSession {
  debug: false;
  testRun: number;
  status: TestSessionStatus;
  passed?: boolean;
  errors: TestResultError[];
  testResults?: TestSuiteResult;
  logs: any[][];
  request404s: string[];
  testCoverage?: CoverageMapData;
}
