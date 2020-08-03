import {
  sessionStarted,
  sessionFinished as browserLibOnSessionFinished,
  sessionFailed,
} from '@web/test-runner-browser-lib';
import 'mocha/mocha.js';
import { collectTestResults } from './collectTestResults';

const mocha = (window as any).mocha as BrowserMocha;

sessionStarted();

export function sessionFinished() {
  // setTimeout to wait for event loop to unwind and collect all logs
  setTimeout(() => {
    const { testResults, hookErrors, passed } = collectTestResults(mocha);

    browserLibOnSessionFinished({
      passed: hookErrors.length === 0 && passed,
      errors: hookErrors,
      testResults,
    });
  });
}

export { mocha, sessionFailed };
