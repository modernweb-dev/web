import { sessionFinished, sessionStarted } from '@web/test-runner-browser-lib';
import 'mocha/mocha.js';
/* eslint-disable-next-line */
// @ts-ignore
import styles from 'mocha/mocha.css';
import { collectTestResults } from './collectTestResults';

sessionStarted();

mocha.setup({ ui: 'bdd', allowUncaught: false });

const div = document.createElement('div');
div.id = 'mocha';
document.body.appendChild(div);

const styleElement = document.createElement('style');
styleElement.textContent = styles;
document.head.appendChild(styleElement);

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
