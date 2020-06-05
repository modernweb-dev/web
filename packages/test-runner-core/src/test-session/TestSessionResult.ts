import { CoverageMapData } from 'istanbul-lib-coverage';

export interface FailedImport {
  file: string;
  error: TestResultError;
}

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

export interface TestSessionResult {
  passed: boolean;
  error?: TestResultError;
  tests: TestResult[];
  logs: string[];
  failedImports: FailedImport[];
  request404s: Set<string>;
  testCoverage?: CoverageMapData;
}
