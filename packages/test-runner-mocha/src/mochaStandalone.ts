import {
  sessionStarted,
  sessionFinished as testRunnerOnSessionFinished,
  sessionFailed,
  getConfig,
  TestResultError,
} from '../../test-runner-core/browser/session.js';
import { collectTestResults } from './collectTestResults.js';
import { setupMocha } from './mochaSetup.js';

sessionStarted();

export async function runMochaTests(mocha: BrowserMocha, testFn: () => unknown | Promise<unknown>) {
  const { debug, testFrameworkConfig } = await getConfig();
  setupMocha(debug, testFrameworkConfig);

  // setup the tests
  try {
    await testFn();
  } catch (error) {
    sessionFailed(error as TestResultError);
    return;
  }

  // run the tests, and notify the test runner after finishing
  const mochaRunner = mocha.run(sessionFinished);
  (window as any).__WTR_MOCHA_RUNNER__ = mochaRunner;
}

export function sessionFinished() {
  // setTimeout to wait for event loop to unwind and collect all logs
  setTimeout(() => {
    const { testResults, hookErrors, passed } = collectTestResults(mocha);

    testRunnerOnSessionFinished({
      passed: hookErrors.length === 0 && passed,
      errors: hookErrors,
      testResults,
    });
  });
}

export { sessionFailed };
