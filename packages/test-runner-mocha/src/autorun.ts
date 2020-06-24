import {
  sessionFinished,
  getConfig,
  captureConsoleOutput,
  logUncaughtErrors,
  sessionStarted,
  TestResultError,
} from '@web/test-runner-browser-lib';
import 'mocha/mocha.js';
import { collectTestResults } from './collectTestResults';

captureConsoleOutput();
logUncaughtErrors();

(async () => {
  const errors: TestResultError[] = [];

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
