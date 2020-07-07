import {
  sessionFinished,
  getConfig,
  captureConsoleOutput,
  logUncaughtErrors,
  sessionStarted,
  TestResultError,
} from '@web/test-runner-browser-lib';
import 'mocha/mocha.js';
/* eslint-disable-next-line */
// @ts-ignore
import styles from 'mocha/mocha.css';
import { collectTestResults } from './collectTestResults';

captureConsoleOutput();
logUncaughtErrors();
sessionStarted();

(async () => {
  const errors: TestResultError[] = [];

  const { testFile, debug } = await getConfig();
  const div = document.createElement('div');
  div.id = 'mocha';
  document.body.appendChild(div);

  if (debug) {
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }

  mocha.setup({ ui: 'bdd', allowUncaught: false });

  await import(new URL(testFile, document.baseURI).href).catch(error => {
    errors.push({ message: error.message, stack: error.stack });
  });

  mocha.run(failures => {
    // setTimeout to wait for logs to come in
    setTimeout(() => {
      const { testResults, hookErrors } = collectTestResults(mocha);
      errors.push(...hookErrors);

      sessionFinished({
        passed: errors.length === 0 && failures === 0,
        errors,
        tests: testResults,
      });
    });
  });
})();
