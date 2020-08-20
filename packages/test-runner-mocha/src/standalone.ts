import {
  sessionStarted,
  sessionFinished as testRunnerOnSessionFinished,
  sessionFailed,
  getConfig,
} from '../../test-runner-core/browser/session.js';
import '../../../node_modules/mocha/mocha.js';
import { collectTestResults } from './collectTestResults.js';

const mocha = (window as any).mocha as BrowserMocha;

sessionStarted();

export async function runTests(testFn: () => unknown | Promise<unknown>) {
  const { testFrameworkConfig } = await getConfig();

  // setup mocha
  const userOptions = typeof testFrameworkConfig === 'object' ? testFrameworkConfig : {};
  mocha.setup({ ui: 'bdd', allowUncaught: false, ...userOptions });

  // setup the tests
  try {
    await testFn();
  } catch (error) {
    sessionFailed(error);
    return;
  }

  // run the tests, and notify the test runner after finishing
  mocha.run(sessionFinished);
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

export { mocha, sessionFailed };
