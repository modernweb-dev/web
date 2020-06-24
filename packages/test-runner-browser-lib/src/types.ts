export interface RuntimeConfig {
  testFile: string;
  watch: boolean;
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

export interface FrameworkTestSessionResult {
  passed: boolean;
  errors?: TestResultError[];
  tests: TestResult[];
}

export interface BrowserTestSessionResult extends FrameworkTestSessionResult {
  testCoverage?: unknown;
  errors: TestResultError[];
  logs: string[];
}
