import {
  sessionFinished,
  getConfig,
  sessionStarted,
  TestResultError,
} from '@web/test-runner-browser-lib';
import 'mocha/mocha.js';
/* eslint-disable-next-line */
// @ts-ignore
import styles from 'mocha/mocha.css';
import { collectTestResults } from './collectTestResults';

sessionStarted();

(async () => {
  const errors: TestResultError[] = [];

  const { testFile, debug, testFrameworkConfig } = await getConfig();
  const div = document.createElement('div');
  div.id = 'mocha';
  document.body.appendChild(div);

  if (debug) {
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }

  const userOptions = typeof testFrameworkConfig === 'object' ? testFrameworkConfig : {};
  mocha.setup({ ui: 'bdd', allowUncaught: false, ...userOptions });

  await import(new URL(testFile, document.baseURI).href).catch(error => {
    console.error(error);
    errors.push({
      message:
        'Could not import your test module. Check the browser logs or open the browser in debug mode for more information.',
    });
  });

  mocha.run(() => {
    // setTimeout to wait for logs to come in
    setTimeout(() => {
      const { testResults, hookErrors, passed } = collectTestResults(mocha);
      errors.push(...hookErrors);

      sessionFinished({
        passed: errors.length === 0 && passed,
        errors,
        testResults,
      });
    });
  });
})();
