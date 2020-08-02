import { CoverageMapData } from 'istanbul-lib-coverage';
import { TestSessionStatus } from './TestSessionStatus';
import { BasicTestSession } from './BasicTestSession';

export interface TestResultError {
  message: string;
  stack?: string;
  expected?: string;
  actual?: string;
}

export interface TestResult {
  name: string;
  passed: boolean;
  error?: TestResultError;
}

export interface TestSession extends BasicTestSession {
  debug: false;
  testRun: number;
  status: TestSessionStatus;
  passed?: boolean;
  errors: TestResultError[];
  tests: TestResult[];
  logs: any[][];
  request404s: string[];
  testCoverage?: CoverageMapData;
  userAgent?: string;
}
