export interface RuntimeConfig {
  testFile: string;
  watch: boolean;
}

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

export interface FrameworkTestSessionResult {
  passed: boolean;
  error?: TestResultError;
  tests: TestResult[];
  failedImports: FailedImport[];
}

export interface BrowserTestSessionResult extends FrameworkTestSessionResult {
  testCoverage?: unknown;
  logs: string[];
}
