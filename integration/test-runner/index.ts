import { BrowserLauncher, TestRunnerCoreConfig } from '@web/test-runner-core';
import { runBasicTest } from './tests/basic/runBasicTest';
import { runConfigGroupsTest } from './tests/config-groups/runConfigGroupsTest';
import { runParallelTest } from './tests/parallel/runParallelTest';
import { runTestFailureTest } from './tests/test-failure/runTestFailureTest';
import { runLocationChangeTest } from './tests/location-change/runLocationChangeTest';
import { runFocusTest } from './tests/focus/runFocusTest';

export interface Tests {
  basic: boolean;
  focus: boolean;
  groups: boolean;
  parallel: boolean;
  testFailure: boolean;
  locationChanged: boolean;
}

export function runIntegrationTests(
  createConfig: () => Partial<TestRunnerCoreConfig> & { browsers: BrowserLauncher[] },
  tests: Tests,
) {
  if (tests.basic !== false) {
    runBasicTest(createConfig());
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
