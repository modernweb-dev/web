import { CoverageMapData } from 'istanbul-lib-coverage';
import { TestSessionStatus } from './TestSessionStatus';
import { BrowserLauncher } from '../browser-launcher/BrowserLauncher';

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

export interface TestSession {
  id: string;
  testRun: number;
  browserLauncher: BrowserLauncher;
  browserName: string;
  testFile: string;
  status: TestSessionStatus;
  passed?: boolean;
  errors: TestResultError[];
  tests: TestResult[];
  logs: string[];
  request404s: string[];
  testCoverage?: CoverageMapData;
}
