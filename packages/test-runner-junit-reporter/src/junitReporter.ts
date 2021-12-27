import 'array-flat-polyfill';
import path from 'path';
import fs from 'fs';
import { Reporter, TestResult, TestSession, TestSuiteResult } from '@web/test-runner-core';

import XML from 'xml';

export interface JUnitReporterArgs {
  outputPath?: string;
  reportLogs?: boolean;
  /* package root dir. defaults to cwd */
  rootDir?: string;
}

type TestSessionMetadata = Omit<TestSession, 'tests'>;

type TestResultWithMetadata = TestResult & TestSessionMetadata & { suiteName: string };

// Browser name is highly dynamic, hence `string`
type TestResultsWithMetadataByBrowserTestFileName = Record<string, TestResultWithMetadata[]>;

interface TestFailureXMLElement {
  _cdata?: string | string[];
  _attr: {
    message: string;
    type: string;
  };
}

interface TestCaseXMLAttributes {
  _attr: {
    name: string;
    time: number;
    file: string;
    line?: string;
    classname: string;
  };
}

type PassedTestCase = TestCaseXMLAttributes;
type SkippedTestCase = [TestCaseXMLAttributes, { skipped: null }];
type FailedTestCase = [TestCaseXMLAttributes, { failure: TestFailureXMLElement }];

interface TestCaseXMLElement {
  testcase: PassedTestCase | SkippedTestCase | FailedTestCase;
}

type TestSuitePropertiesXMLElement = {
  property: {
    _attr: {
      name: string;
      value: string;
    };
  };
};

interface TestSuiteXMLAttributes {
  _attr: {
    name: string;
    id: number;
    tests: number;
    skipped: number;
    errors: number;
    failures: number;
    time: number;
  };
}

const assignSessionAndSuitePropertiesToTests = ({
  testResults,
  ...rest
}: TestSession): TestResultWithMetadata[] => {
  const assignToTest =
    (parentSuiteName: string) =>
    (test: TestResult): TestResultWithMetadata => {
      const suiteName = parentSuiteName.replace(/^\s+/, '');
      return { ...test, ...rest, suiteName };
    };

  const assignToSuite =
    (parentSuiteName: string) =>
    (suite: TestSuiteResult): TestResultWithMetadata[] =>
      [
        ...suite.tests.map(assignToTest(`${parentSuiteName} ${suite.name}`)),
        ...(suite.suites?.flatMap?.(assignToSuite(`${parentSuiteName} ${suite.name}`)) ?? []),
      ];

  const suites = testResults?.suites ?? [];

  return suites.flatMap(assignToSuite(''));
};

const toResultsWithMetadataByBrowserTestFileName = (
  acc: TestResultsWithMetadataByBrowserTestFileName,
  test: TestResultWithMetadata,
): TestResultsWithMetadataByBrowserTestFileName => {
  const testSuiteName = `${test.browser.name}_${test.browser.type}_${test.testFile.replace(
    process.cwd(),
    '',
  )}`;
  return { ...acc, [testSuiteName]: [...(acc[testSuiteName] ?? []), test] };
};

const escapeLogs = (test: TestResultWithMetadata) =>
  test.logs.flatMap(x => x.map(_cdata => ({ _cdata: stripXMLInvalidChars(_cdata) })));

const isFailedTest = (test: TestResult): boolean =>
  // NB: shouldn't have to check for `error`,
  // but ATM all tests are coming back `passed: false`
  !test.passed && !!test.error;

const isSkippedTest = (test: TestResult): boolean => !!test.skipped;

const addSuiteTime = (time: number, test: TestResultWithMetadata) =>
  time + (test.duration || 0) / 1000;

type TestMetaGetter<T = string> = (test: TestResultWithMetadata) => T;

const getTestName: TestMetaGetter = test => test.name;

const getSuiteName: TestMetaGetter = test => test.suiteName;

const getTestFile: TestMetaGetter = test => test.testFile;

const getTestDurationInSeconds = ({ duration }: TestResult): number =>
  (typeof duration === 'undefined' ? 0 : duration) / 1000;

// A subset of invalid characters as defined in http://www.w3.org/TR/xml/#charsets that can occur in e.g. stacktraces
// lifted from https://github.com/michaelleeallen/mocha-junit-reporter/blob/master/index.js (licensed MIT)
// other portions of code adapted from same
// regex lifted from https://github.com/MylesBorins/xml-sanitizer/ (licensed MIT)
const INVALID_CHARACTERS_REGEX =
  // eslint-disable-next-line no-control-regex
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007f-\u0084\u0086-\u009f\uD800-\uDFFF\uFDD0-\uFDFF\uFFFF\uC008]/g;

const STACK_TRACE_UNIQUE_IDS_REGEX =
  /localhost:\d+|wtr-session-id=[\w\d]+-[\w\d]+-[\w\d]+-[\w\d]+-[\w\d]+|/g;

const stripXMLInvalidChars = (x: string): string =>
  x && x.replace ? x.replace(INVALID_CHARACTERS_REGEX, '') : x;

/**
 * Makes a `<failure>` element
 */
function testFailureXMLElement(test: TestResultWithMetadata): TestFailureXMLElement {
  const { error } = test;

  const message = stripXMLInvalidChars(error?.message ?? '');

  const stack = stripXMLInvalidChars(error?.stack ?? '');

  const type = error?.name ?? (stack.match(/^\w+Error:/) ? stack.split(':')[0] : '');

  return {
    _attr: { message, type },
    _cdata: `${type}: ${message}\n${stack}`.replace(STACK_TRACE_UNIQUE_IDS_REGEX, ''),
  };
}

/**
 * Makes attributes for a `<testcase>` element
 * @param test Test Result
 */
function testCaseXMLAttributes(
  test: TestResultWithMetadata,
  rootDir: string,
): TestCaseXMLAttributes {
  const name = getTestName(test);

  const time = getTestDurationInSeconds(test);

  const classname = getSuiteName(test);

  const file = getTestFile(test).replace(`${rootDir}${path.sep}`, '');

  const [, line] = stripXMLInvalidChars(test.error?.stack ?? '').match(/(\d+):\d+/m) ?? [];

  return {
    _attr: {
      name,
      time,
      classname,
      file,
      ...(!!line && { line }),
    },
  };
}

/**
 * Makes a `<testcase>` element
 */
function testCaseXMLElement(test: TestResultWithMetadata, rootDir: string): TestCaseXMLElement {
  const attributes = testCaseXMLAttributes(test, rootDir);

  // prettier-ignore
  if (isSkippedTest(test))
    return { testcase: [attributes, { skipped: null }] };
  else if (isFailedTest(test))
    return { testcase: [attributes, { failure: testFailureXMLElement(test) }] };
  else // prettier-ignore
    return { testcase: attributes };
}

/**
 * Makes attributes for a `<testsuite>` element
 * @param name Test Suite Name
 * @param id Test Run ID
 * @param results Test Results
 */
function testSuiteXMLAttributes(
  name: string,
  id: number,
  results: TestResultWithMetadata[],
): TestSuiteXMLAttributes {
  const tests = results.length;

  const skipped = results.filter(x => x.skipped).length;

  const errors = results.map(x => x.error).filter(Boolean).length;

  const failures = results.filter(isFailedTest).length;

  const time = results.reduce(addSuiteTime, 0);

  return {
    _attr: {
      name,
      id,
      tests,
      skipped,
      errors,
      failures,
      time,
    },
  };
}

/**
 * Makes a `<properties>` element
 * @param testFile Absolute path to test file
 * @param browserName Short browser name
 * @param launcherType browser launcher type
 */
function testSuitePropertiesXMLElement(
  testFile: string,
  browserName: string,
  launcherType: string,
  rootDir: string,
): TestSuitePropertiesXMLElement[] {
  return [
    {
      property: {
        _attr: {
          name: 'test.fileName',
          value: testFile.replace(`${rootDir}${path.sep}`, ''),
        },
      },
    },
    {
      property: {
        _attr: {
          name: 'browser.name',
          value: browserName,
        },
      },
    },
    {
      property: {
        _attr: {
          name: 'browser.launcher',
          value: launcherType,
        },
      },
    },
  ];
}

/**
 * Collates test sessions by browser, converts them to an XML object representation,
 * then stringifies the XML.
 * @param sessions Test Sessions
 */
function getTestRunXML({
  reportLogs,
  rootDir,
  sessions,
}: {
  sessions: TestSession[];
  reportLogs: boolean;
  rootDir: string;
}): string {
  const testsuites = Object.entries(
    sessions
      .flatMap(assignSessionAndSuitePropertiesToTests)
      .reduce(
        toResultsWithMetadataByBrowserTestFileName,
        {} as TestResultsWithMetadataByBrowserTestFileName,
      ),
  ).map(([name, tests]) => {
    const [{ testRun = 0, browser, testFile }] = tests;

    const browserName = browser.name ?? '';

    const launcherType = browser.type ?? '';

    const attributes = testSuiteXMLAttributes(name, testRun, tests);

    const properties = testSuitePropertiesXMLElement(testFile, browserName, launcherType, rootDir);

    const testcases = tests.map(t => testCaseXMLElement(t, rootDir));

    const systemOut = !reportLogs ? [] : tests.flatMap(escapeLogs).map(x => ({ 'system-out': x }));

    const testsuite = [attributes, { properties }, ...testcases, ...systemOut];

    return { testsuite };
  });

  return XML({ testsuites }, { declaration: true, indent: '  ' });
}

/**
 * A JUnit-format XML file reporter for Web Test Runner
 *
 * @param args Options for JUnit Reporter
 */
export function junitReporter({
  outputPath = './test-results.xml',
  reportLogs = false,
  rootDir = process.cwd(),
}: JUnitReporterArgs = {}): Reporter {
  const filepath = path.resolve(rootDir, outputPath);
  const dir = path.dirname(filepath);
  return {
    onTestRunFinished({ sessions }) {
      const xml = getTestRunXML({ reportLogs, rootDir, sessions });
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filepath, xml);
    },
  };
}
