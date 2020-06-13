import { sessionFinished, captureConsoleOutput, logUncaughtErrors, sessionStarted, } from '@web/test-runner-browser-lib';
import 'mocha/mocha.js';
captureConsoleOutput();
logUncaughtErrors();
sessionStarted();
mocha.setup({ ui: 'bdd', reporter: 'spec', allowUncaught: false });
export function runTests() {
    mocha.run(failures => {
        // setTimeout to wait for event loop to unwind and collect all logs
        setTimeout(() => {
            const testResults = [];
            function collectTests(prefix, tests) {
                for (const test of tests) {
                    // add test if it isn't pending (skipped)
                    if (!test.isPending()) {
                        const name = `${prefix}${test.title}`;
                        const err = test.err;
                        testResults.push({
                            name,
                            passed: test.isPassed(),
                            error: err
                                ? {
                                    message: err.message,
                                    stack: err.stack,
                                    expected: err.expected,
                                    actual: err.actual,
                                }
                                : undefined,
                        });
                    }
                }
            }
            function collectSuite(prefix, suite) {
                collectTests(prefix, suite.tests);
                for (const childSuite of suite.suites) {
                    const newPrefix = `${prefix}${childSuite.title} > `;
                    collectSuite(newPrefix, childSuite);
                }
            }
            collectSuite('', mocha.suite);
            sessionFinished({
                passed: failures === 0,
                failedImports: [],
                tests: testResults,
            });
        });
    });
}
//# sourceMappingURL=standalone.js.map