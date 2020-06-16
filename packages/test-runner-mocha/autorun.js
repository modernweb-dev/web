import { sessionFinished, getConfig, captureConsoleOutput, logUncaughtErrors, sessionStarted, } from '@web/test-runner-browser-lib';
import 'mocha/mocha.js';
captureConsoleOutput();
logUncaughtErrors();
(async () => {
    sessionStarted();
    const { testFile, debug } = await getConfig();
    const div = document.createElement('div');
    div.id = 'mocha';
    document.body.appendChild(div);
    if (debug) {
        import('./styles').then(module => {
            const styleElement = document.createElement('style');
            styleElement.textContent = module.styles;
            document.head.appendChild(styleElement);
        });
    }
    mocha.setup({ ui: 'bdd', allowUncaught: false });
    const failedImports = [];
    await import(new URL(testFile, document.baseURI).href).catch(error => {
        failedImports.push({ file: testFile, error: { message: error.message, stack: error.stack } });
    });
    mocha.run(failures => {
        // setTimeout to wait for logs to come in
        setTimeout(() => {
            const testResults = [];
            function iterateTests(prefix, tests) {
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
            function iterateSuite(prefix, suite) {
                iterateTests(prefix, suite.tests);
                for (const childSuite of suite.suites) {
                    const newPrefix = `${prefix}${childSuite.title} > `;
                    iterateSuite(newPrefix, childSuite);
                }
            }
            iterateSuite('', mocha.suite);
            sessionFinished({
                passed: failedImports.length === 0 && failures === 0,
                failedImports,
                tests: testResults,
            });
        });
    });
})();
//# sourceMappingURL=autorun.js.map