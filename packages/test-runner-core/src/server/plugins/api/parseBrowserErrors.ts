import { MapStackLocation, parseStackTrace } from '@web/browser-logs';
import { MapBrowserUrl } from '@web/browser-logs/src/parseStackTrace';

import { TestRunnerCoreConfig } from '../../../config/TestRunnerCoreConfig';
import {
  TestResult,
  TestResultError,
  TestSession,
  TestSuiteResult,
} from '../../../test-session/TestSession';
import { forEachAsync } from '../../../utils/async';

export async function replaceErrorStack(
  error: TestResultError,
  mapBrowserUrl: MapBrowserUrl,
  mapStackLocation: MapStackLocation,
  rootDir: string,
) {
  try {
    error.stack = await parseStackTrace(error.message, error.stack!, {
      mapBrowserUrl,
      mapStackLocation,
      browserRootDir: rootDir,
    });
  } catch (error) {
    console.error('Error while parsing browser error');
    console.error(error);
  }
}

export async function parseSessionErrors(
  config: TestRunnerCoreConfig,
  mapBrowserUrl: MapBrowserUrl,
  mapStackLocation: MapStackLocation,
  result: Partial<TestSession>,
) {
  if (!result.errors) {
    return;
  }

  await forEachAsync(result.errors, err => {
    if (err.stack) {
      return replaceErrorStack(err, mapBrowserUrl, mapStackLocation, config.rootDir);
    }
  });
}

export async function parseTestResults(
  config: TestRunnerCoreConfig,
  mapBrowserUrl: MapBrowserUrl,
  mapStackLocation: MapStackLocation,
  result: Partial<TestSession>,
) {
  if (!result.testResults) {
    return;
  }

  async function iterateTests(tests: TestResult[]) {
    await forEachAsync(tests, async test => {
      if (test.error?.stack) {
        await replaceErrorStack(test.error, mapBrowserUrl, mapStackLocation, config.rootDir);
      }
    });
  }

  async function iterateSuite(suite: TestSuiteResult) {
    await Promise.all([iterateSuites(suite.suites), iterateTests(suite.tests)]);
  }

  async function iterateSuites(suites: TestSuiteResult[]) {
    await forEachAsync(suites, s => iterateSuite(s));
  }

  await iterateSuite(result.testResults);
}
