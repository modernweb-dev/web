export function collectTestResults(mocha) {
    const testResults = [];
    const hookErrors = [];
    function iterateHooks(hooks) {
        var _a, _b;
        for (const hook of hooks) {
            const hookError = hook.err;
            if (hook.state === 'failed' || hookError) {
                if (hookError) {
                    const message = hook.title;
                    const stackArray = (_b = (_a = hookError.stack) === null || _a === void 0 ? void 0 : _a.split('\n')) !== null && _b !== void 0 ? _b : [];
                    if (!stackArray[0].includes(hookError.message)) {
                        stackArray === null || stackArray === void 0 ? void 0 : stackArray.unshift(hookError.message);
                    }
                    hookErrors.push({ message, stack: stackArray.join('\n') });
                }
                else {
                    hookErrors.push({ message: 'Unknown error' });
                }
            }
        }
    }
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
        iterateHooks(suite._beforeAll);
        iterateHooks(suite._afterAll);
        iterateHooks(suite._beforeEach);
        iterateHooks(suite._afterEach);
        iterateTests(prefix, suite.tests);
        for (const childSuite of suite.suites) {
            const newPrefix = `${prefix}${childSuite.title} > `;
            iterateSuite(newPrefix, childSuite);
        }
    }
    iterateSuite('', mocha.suite);
    return { testResults, hookErrors };
}
//# sourceMappingURL=collectTestResults.js.map