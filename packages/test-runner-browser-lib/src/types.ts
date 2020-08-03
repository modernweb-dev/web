export interface RuntimeConfig {
  testFile: string;
  watch: boolean;
  testFrameworkConfig?: unknown;
}

export interface TestResultError {
  message: string;
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

export interface FrameworkTestSessionResult {
  passed: boolean;
  errors?: TestResultError[];
  testResults?: TestSuiteResult;
}

export interface BrowserTestSessionResult extends FrameworkTestSessionResult {
  testCoverage?: unknown;
  logs: string[];
}
