/// <reference types="mocha" />
import { TestResult, TestResultError } from '@web/test-runner-browser-lib';
export declare function collectTestResults(mocha: BrowserMocha): {
    testResults: TestResult[];
    hookErrors: TestResultError[];
};
//# sourceMappingURL=collectTestResults.d.ts.map