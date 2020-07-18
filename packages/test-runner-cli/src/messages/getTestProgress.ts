import {
  TestRunnerCoreConfig,
  TestSessionManager,
  SESSION_STATUS,
  TestCoverage,
  CoverageConfig,
} from '@web/test-runner-core';
import chalk from 'chalk';
import { TerminalEntry } from '../Terminal';
import { getTestCoverage } from './getTestCoverage';

export interface TestProgressArgs {
  browserNames: string[];
  testFiles: string[];
  testRun: number;
  sessions: TestSessionManager;
  startTime: number;
  watch: boolean;
  focusedTestFile?: string;
  openingDebugBrowser: boolean;
  coverage: boolean;
  coverageConfig?: CoverageConfig;
  testCoverage?: TestCoverage;
}

const fullProgress = '█';
function getPartialProgress(percent: number) {
  if (percent <= 1 / 8) {
    return '▏';
  } else if (percent <= 1 / 4) {
    return '▎';
  } else if (percent <= 3 / 8) {
    return '▍';
  } else if (percent <= 1 / 2) {
    return '▌';
  } else if (percent <= 5 / 8) {
    return '▋';
  } else if (percent <= 3 / 4) {
    return '▊';
  } else if (percent <= 7 / 8) {
    return '▉';
  } else {
    return fullProgress;
  }
}

function renderProgressBar(finished: number, total: number) {
  const length = 30;
  const blockWidth = 100 / length / 100;
  const percentFinished = finished / total;

  let progressBar = '|';
  let remaining = percentFinished;
  for (let i = 0; i < length; i += 1) {
    if (remaining === 0) {
      progressBar += ' ';
    } else if (remaining >= blockWidth) {
      progressBar += fullProgress;
      remaining -= blockWidth;
    } else {
      progressBar += getPartialProgress(remaining * 10);
      remaining = 0;
    }
  }
  progressBar += '|';

  return progressBar;
}

function getProgressReport(
  name: string,
  minWidth: number,
  finishedFiles: number,
  testFiles: number,
  passedTests: number,
  failedTests: number,
) {
  const testResults = `${chalk.green(`${passedTests} passed`)}, ${chalk.red(
    `${failedTests} failed`,
  )}`;
  const progressBar = `${renderProgressBar(
    finishedFiles,
    testFiles,
  )} ${finishedFiles}/${testFiles} test files`;
  return `${`${name}:`.padEnd(minWidth)} ${progressBar} | ${testResults}`;
}

export function getTestProgressReport(config: TestRunnerCoreConfig, args: TestProgressArgs) {
  const {
    browserNames,
    testRun,
    testFiles: allTestFiles,
    sessions,
    watch,
    startTime,
    focusedTestFile,
    openingDebugBrowser,
    coverage,
    coverageConfig,
    testCoverage,
  } = args;
  const testFiles = focusedTestFile ? [focusedTestFile] : allTestFiles;

  const entries: TerminalEntry[] = [];
  const unfinishedSessions = Array.from(
    sessions.forStatusAndTestFile(
      focusedTestFile,
      SESSION_STATUS.SCHEDULED,
      SESSION_STATUS.INITIALIZING,
      SESSION_STATUS.STARTED,
    ),
  );

  const passedTests = new Set<string>();
  const failedTests = new Set<string>();
  const finishedFiles = new Set<string>();
  const browserProgressEntries: string[] = [];
  let failed = false;

  const minWidth = browserNames.sort((a, b) => b.length - a.length)[0].length + 1;
  for (const browser of browserNames) {
    const sessionsForBrowser = sessions.forBrowserAndTestFile(focusedTestFile, browser);
    let finishedFilesForBrowser = 0;
    let passedTestsForBrowser = 0;
    let failedTestsForBrowser = 0;

    for (const session of sessionsForBrowser) {
      if (!session.passed) {
        failed = true;
      }

      if (session.status === SESSION_STATUS.FINISHED) {
        const { testFile, tests } = session;
        finishedFiles.add(testFile);
        finishedFilesForBrowser += 1;

        for (const test of tests) {
          if (test.passed) {
            passedTests.add(`${testFile}${test.name}`);
            passedTestsForBrowser += 1;
          } else {
            failedTests.add(`${testFile}${test.name}`);
            failedTestsForBrowser += 1;
          }
        }
      }
    }

    browserProgressEntries.push(
      getProgressReport(
        browser,
        minWidth,
        finishedFilesForBrowser,
        testFiles.length,
        passedTestsForBrowser,
        failedTestsForBrowser,
      ),
    );
  }

  if (browserNames.length > 1) {
    entries.push(
      getProgressReport(
        'Total',
        minWidth,
        finishedFiles.size,
        testFiles.length,
        passedTests.size,
        failedTests.size,
      ),
    );
    entries.push('');
    entries.push(...browserProgressEntries.map(text => text));
  } else {
    entries.push(...browserProgressEntries);
  }

  entries.push('');

  if (coverage && coverageConfig) {
    if (testCoverage) {
      if (!testCoverage.passed) {
        failed = true;
      }
      const coverageReport = getTestCoverage(testCoverage, watch, coverageConfig);
      entries.push(...coverageReport);
    }
  }

  if (testRun !== -1 && unfinishedSessions.length === 0) {
    if (openingDebugBrowser) {
      entries.push(chalk.bold(`Opening debug browser...`));
    } else if (coverage && !testCoverage) {
      entries.push(chalk.bold('Calculating test coverage...'));
    } else if (config.watch) {
      entries.push(chalk.bold(`Finished running tests, watching for file changes...`));
    } else {
      const durationInSec = (Date.now() - startTime) / 1000;
      const duration = Math.trunc(durationInSec * 10) / 10;

      if (failed) {
        if (!testCoverage?.passed) {
          entries.push(
            chalk.bold(
              chalk.red(
                `Finished running tests in ${duration}s, failed to meet coverage threshold.`,
              ),
            ),
          );
        } else if (failedTests.size > 0) {
          entries.push(
            chalk.bold(
              chalk.red(
                `Finished running tests in ${duration}s with ${failedTests.size} tests failed.`,
              ),
            ),
          );
        } else if (finishedFiles.size > 0) {
          entries.push(chalk.bold(chalk.red(`Error while running tests.`)));
        } else {
          entries.push(chalk.bold(chalk.red(`Failed to run any tests.`)));
        }
      } else {
        entries.push(chalk.bold(`Finished running tests in ${duration}s, all tests passed! 🎉`));
      }
    }
  } else {
    entries.push(chalk.bold('Running tests...'));
  }

  entries.push('');

  return entries;
}
