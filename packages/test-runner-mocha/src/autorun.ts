import {
  sessionFinished,
  getConfig,
  sessionStarted,
  TestResultError,
} from '../../test-runner-core/browser/session.js';
import '../../../node_modules/mocha/mocha.js';
import { collectTestResults } from './collectTestResults.js';
import { setupMocha } from './mochaSetup.js';

sessionStarted();

// avoid using document.baseURI for IE11 support
const base = document.querySelector('base');
const baseURI = (base || window.location).href;

(async () => {
  const errors: TestResultError[] = [];

  const { testFile, debug, testFrameworkConfig } = await getConfig();
  setupMocha(debug, testFrameworkConfig);

  await import(new URL(testFile, baseURI).href).catch(error => {
    console.error(error);
    errors.push({
      message:
        'Could not import your test module. Check the browser logs or open the browser in debug mode for more information.',
    });
  });

  const mochaRunner = mocha.run(() => {
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
  (window as any).__WTR_MOCHA_RUNNER__ = mochaRunner;
})();
