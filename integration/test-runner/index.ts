import { BrowserLauncher, TestRunnerCoreConfig } from '@web/test-runner-core';
import { runBasicTest } from './tests/basic/runBasicTest.js';
import { runConfigGroupsTest } from './tests/config-groups/runConfigGroupsTest.js';
import { runParallelTest } from './tests/parallel/runParallelTest.js';
import { runTestFailureTest } from './tests/test-failure/runTestFailureTest.js';
import { runLocationChangeTest } from './tests/location-change/runLocationChangeTest.js';
import { runFocusTest } from './tests/focus/runFocusTest.js';
import { runManyTests } from './tests/many/runManyTests.js';

export interface Tests {
  basic: boolean;
  many: boolean;
  focus: boolean;
  groups: boolean;
  parallel: boolean;
  testFailure: boolean;
  locationChanged: boolean;
}

export async function runIntegrationTests(
  createConfig: () => Partial<TestRunnerCoreConfig> & { browsers: BrowserLauncher[] },
  tests: Tests,
) {
  if (tests.basic !== false) {
    runBasicTest(createConfig());
  }

  if (tests.many !== false) {
    runManyTests(createConfig());
  }

  if (tests.focus !== false) {
    runFocusTest(createConfig());
  }

  if (tests.groups !== false) {
    runConfigGroupsTest(createConfig());
  }

  if (tests.parallel !== false) {
    runParallelTest(createConfig);
  }

  if (tests.testFailure !== false) {
    runTestFailureTest(createConfig());
  }

  if (tests.locationChanged !== false) {
    runLocationChangeTest(createConfig());
  }
}
