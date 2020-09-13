import {
  TestRunnerCoreConfig,
  TestSessionManager,
  SESSION_STATUS,
  TestCoverage,
  CoverageConfig,
} from '@web/test-runner-core';
import chalk from 'chalk';
import { getPassedFailedSkippedCount } from '../utils/getPassedFailedSkippedCount';
import { getCodeCoverage } from './getCodeCoverage';

export interface TestProgressArgs {
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
  skippedTests: number,
  failedTests: number,
) {
  const testResults =
    `${chalk.green(`${passedTests} passed`)}` +
    `, ${chalk.red(`${failedTests} failed`)}` +
    (skippedTests !== 0 ? `, ${chalk.gray(`${skippedTests} skipped`)}` : '');
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

  const minWidth = browserNames.sort((a, b) => b.length - a.length)[0].length + 1;
  for (const browserName of browserNames) {
    const allSessionsForBrowser = Array.from(sessions.forBrowserName(browserName));
    const sessionsForBrowser = focusedTestFile
      ? allSessionsForBrowser.filter(s => s.testFile === focusedTestFile)
      : allSessionsForBrowser;
    const totalTestFiles = new Set(sessionsForBrowser.map(s => s.testFile)).size;
    let finishedFilesForBrowser = 0;
    let passedTestsForBrowser = 0;
    let skippedTestsForBrowser = 0;
    let failedTestsForBrowser = 0;

    for (const session of sessionsForBrowser) {
      if (!session.passed) {
        failed = true;
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
        browserName,
        minWidth,
        finishedFilesForBrowser,
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
