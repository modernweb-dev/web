import type { BrowserLauncher, TestRunnerCoreConfig } from '@web/test-runner-core';
import { runBasicTest } from './tests/basic/runBasicTest.ts';
import { runConfigGroupsTest } from './tests/config-groups/runConfigGroupsTest.ts';
import { runFocusTest } from './tests/focus/runFocusTest.ts';
import { runLocationChangeTest } from './tests/location-change/runLocationChangeTest.ts';
import { runManyTests } from './tests/many/runManyTests.ts';
import { runParallelTest } from './tests/parallel/runParallelTest.ts';
import { runTestFailureTest } from './tests/test-failure/runTestFailureTest.ts';

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
