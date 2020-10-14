import {
  TestRunnerCoreConfig,
  TestSessionManager,
  SESSION_STATUS,
  TestCoverage,
  CoverageConfig,
  BrowserLauncher,
} from '@web/test-runner-core';
import chalk from 'chalk';
import { getPassedFailedSkippedCount } from '../utils/getPassedFailedSkippedCount';
import { getCodeCoverage } from './getCodeCoverage';
import { renderProgressBar } from './renderProgressBar';

export interface TestProgressArgs {
  browsers: BrowserLauncher[];
  browserNames: string[];
  testFiles: string[];
  testRun: number;
  sessions: TestSessionManager;
  startTime: number;
  watch: boolean;
  focusedTestFile?: string;
  coverage: boolean;
  coverageConfig?: CoverageConfig;
  testCoverage?: TestCoverage;
}

function getProgressReport(
  name: string,
  minWidth: number,
  finishedFiles: number,
  activeFiles: number,
  testFiles: number,
  passedTests: number,
  skippedTests: number,
  failedTests: number,
) {
  const testResults =
    `${chalk.green(`${passedTests} passed`)}` +
    `, ${chalk.red(`${failedTests} failed`)}` +
    (skippedTests !== 0 ? `, ${chalk.gray(`${skippedTests} skipped`)}` : '');
  const progressBar = `${renderProgressBar(
    finishedFiles,
    activeFiles,
    testFiles,
  )} ${finishedFiles}/${testFiles} test files`;

  return `${`${name}:`.padEnd(minWidth)} ${progressBar} | ${testResults}`;
}

export function getTestProgressReport(config: TestRunnerCoreConfig, args: TestProgressArgs) {
  const {
    browsers,
    browserNames,
    testRun,
    sessions,
    watch,
    startTime,
    focusedTestFile,
    coverage,
    coverageConfig,
    testCoverage,
  } = args;
  const entries: string[] = [];
  const unfinishedSessions = Array.from(
    sessions.forStatusAndTestFile(
      focusedTestFile,
      SESSION_STATUS.SCHEDULED,
      SESSION_STATUS.INITIALIZING,
      SESSION_STATUS.TEST_STARTED,
      SESSION_STATUS.TEST_FINISHED,
    ),
  );

  const finishedFiles = new Set<string>();
  let failedTestCount = 0;
  let failed = false;

  const minWidth = [...browserNames].sort((a, b) => b.length - a.length)[0].length + 1;
  for (const browser of browsers) {
    // when started or not initiliazing we render a progress bar
    const allSessionsForBrowser = Array.from(sessions.forBrowser(browser));
    const sessionsForBrowser = focusedTestFile
      ? allSessionsForBrowser.filter(s => s.testFile === focusedTestFile)
      : allSessionsForBrowser;
    const totalTestFiles = sessionsForBrowser.length;
    let finishedFilesForBrowser = 0;
    let activeFilesForBrowser = 0;
    let passedTestsForBrowser = 0;
    let skippedTestsForBrowser = 0;
    let failedTestsForBrowser = 0;

    for (const session of sessionsForBrowser) {
      if (!session.passed) {
        failed = true;
      }

      if (![SESSION_STATUS.SCHEDULED, SESSION_STATUS.FINISHED].includes(session.status)) {
        activeFilesForBrowser += 1;
      }

      if (session.status === SESSION_STATUS.FINISHED) {
        const { testFile, testResults } = session;
        finishedFiles.add(testFile);
        finishedFilesForBrowser += 1;
        if (testResults) {
          const parsed = getPassedFailedSkippedCount(testResults);
          passedTestsForBrowser += parsed.passed;
          skippedTestsForBrowser += parsed.skipped;
          failedTestsForBrowser += parsed.failed;
          failedTestCount += parsed.failed;
        }
      }
    }

    entries.push(
      getProgressReport(
        browser.name,
        minWidth,
        finishedFilesForBrowser,
        activeFilesForBrowser,
        totalTestFiles,
        passedTestsForBrowser,
        skippedTestsForBrowser,
        failedTestsForBrowser,
      ),
    );
  }

  entries.push('');

  if (coverage && coverageConfig) {
    if (testCoverage) {
      if (!testCoverage.passed) {
        failed = true;
      }
      const coverageReport = getCodeCoverage(testCoverage, watch, coverageConfig);
      entries.push(...coverageReport);
    }
  }

  if (testRun !== -1 && unfinishedSessions.length === 0) {
    if (coverage && !testCoverage) {
      entries.push(chalk.bold('Calculating code coverage...'));
    } else if (config.watch) {
      entries.push(chalk.bold(`Finished running tests, watching for file changes...`));
    } else {
      const durationInSec = (Date.now() - startTime) / 1000;
      const duration = Math.trunc(durationInSec * 10) / 10;

      if (failed) {
        if (coverage && !testCoverage?.passed) {
          entries.push(
            chalk.bold(
              chalk.red(
                `Finished running tests in ${duration}s, failed to meet coverage threshold.`,
              ),
            ),
          );
        } else if (failedTestCount > 0) {
          entries.push(
            chalk.bold(
              chalk.red(
                `Finished running tests in ${duration}s with ${failedTestCount} failed tests.`,
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
