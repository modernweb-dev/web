import {
  sessionFinished,
  captureConsoleOutput,
  logUncaughtErrors,
  sessionStarted,
} from '@web/test-runner-browser-lib';
import 'mocha/mocha.js';
import { collectTestResults } from './collectTestResults';

captureConsoleOutput();
logUncaughtErrors();
sessionStarted();

mocha.setup({ ui: 'bdd', reporter: 'spec', allowUncaught: false });

export function runTests() {
  mocha.run(failures => {
    // setTimeout to wait for event loop to unwind and collect all logs
    setTimeout(() => {
      const { testResults, hookErrors } = collectTestResults(mocha);

      sessionFinished({
        passed: hookErrors.length === 0 && failures === 0,
        errors: hookErrors,
        tests: testResults,
      });
    });
  });
}
