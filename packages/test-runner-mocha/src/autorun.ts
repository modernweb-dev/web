import {
  sessionFinished,
  getConfig,
  sessionStarted,
  TestResultError,
} from '../../test-runner-browser-lib/dist/index.js';
import '../../../node_modules/mocha/mocha.js';
import { styles } from './styles.js';
import { collectTestResults } from './collectTestResults.js';

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
