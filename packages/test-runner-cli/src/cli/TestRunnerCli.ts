import {
  TestRunnerCoreConfig,
  TestSessionManager,
  TestRunner,
  TestCoverage,
  SESSION_STATUS,
  Report,
  ReportEntry,
} from '@web/test-runner-core';
import chalk from 'chalk';
import path from 'path';
import openBrowser from 'open';

import { writeCoverageReport } from './writeCoverageReport';
import { getSelectFilesMenu } from './getSelectFilesMenu';
import { getWatchCommands } from './getWatchCommands';
import { Terminal } from '../Terminal';

export type MenuType = 'overview' | 'focus' | 'debug';

export const MENUS = {
  OVERVIEW: 'overview' as MenuType,
  FOCUS_SELECT_FILE: 'focus' as MenuType,
  DEBUG_SELECT_FILE: 'debug' as MenuType,
};

const KEYCODES = {
  ENTER: '\r',
  ESCAPE: '\u001b',
  CTRL_C: '\u0003',
  CTRL_D: '\u0004',
};

export class TestRunnerCli {
  private terminal = new Terminal();
  private reportedFilesByTestRun = new Map<number, Set<string>>();
  private sessions: TestSessionManager;
  private activeMenu: MenuType = MENUS.OVERVIEW;
  private menuSucceededAndPendingFiles: string[] = [];
  private menuFailedFiles: string[] = [];
  private openingDebugBrowser = false;
  private testCoverage?: TestCoverage;
  private pendingLogs: Promise<any>[] = [];

  constructor(private config: TestRunnerCoreConfig, private runner: TestRunner) {
    this.sessions = runner.sessions;

    if (config.watch && !this.terminal.isInteractive) {
      this.runner.stop(new Error('Cannot run watch mode in a non-interactive (TTY) terminal.'));
    }
  }

  start() {
    this.setupTerminalEvents();
    this.setupRunnerEvents();

    this.terminal.start();
    if (this.config.watch) {
      this.terminal.clear();
    }

    for (const reporter of this.config.reporters) {
      reporter.start?.({
        config: this.config,
        sessions: this.sessions,
        testFiles: this.runner.testFiles,
        browserNames: this.runner.browserNames,
        startTime: this.runner.startTime,
      });
    }

    this.reportTestResults();
    this.reportTestProgress();

    if (this.config.watch) {
      this.terminal.observeDirectInput();
    }

    if (this.config.staticLogging || !this.terminal.isInteractive) {
      this.terminal.logStatic(
        chalk.bold(`Running ${this.runner.testFiles.length} test files...\n`),
      );
    }
  }

  private setupTerminalEvents() {
    this.terminal.on('input', key => {
      if ([MENUS.DEBUG_SELECT_FILE, MENUS.FOCUS_SELECT_FILE].includes(this.activeMenu)) {
        const i = Number(key);
        if (!Number.isNaN(i)) {
          this.focusTestFileNr(i);
          return;
        }
      }

      switch (key.toUpperCase()) {
        case KEYCODES.CTRL_C:
        case KEYCODES.CTRL_D:
        case 'Q':
          this.runner.stop();
          return;
        case 'D':
          if (this.activeMenu === MENUS.OVERVIEW) {
            if (this.runner.focusedTestFile) {
              this.startDebugFocusedTestFile();
            } else {
              this.switchMenu(MENUS.DEBUG_SELECT_FILE);
            }
          }
          return;
        case 'F':
          if (this.activeMenu === MENUS.OVERVIEW) {
            this.switchMenu(MENUS.FOCUS_SELECT_FILE);
          }
          return;
        case 'C':
          if (this.config.coverage) {
            openBrowser(
              `file://${path.resolve(
                this.config.coverageConfig!.reportDir,
                'lcov-report',
                'index.html',
              )}`,
            );
          }
          return;
        case KEYCODES.ESCAPE:
          if (this.activeMenu === MENUS.OVERVIEW && this.runner.focusedTestFile) {
            this.runner.focusedTestFile = undefined;
            this.reportTestResults(true);
            this.reportTestProgress();
          }
          return;
        case KEYCODES.ENTER:
          this.runner.runTests(this.sessions.all());
          return;
        default:
          return;
      }
    });
  }

  private setupRunnerEvents() {
    this.sessions.on('session-status-updated', session => {
      if (this.activeMenu !== MENUS.OVERVIEW) {
        return;
      }

      if (session.status === SESSION_STATUS.FINISHED) {
        this.reportTestResult(session.testFile);
        this.reportTestProgress();
      }
    });

    this.runner.on('test-run-started', ({ testRun }) => {
      for (const reporter of this.config.reporters) {
        reporter.onTestRunStarted?.({ testRun });
      }

      if (this.activeMenu !== MENUS.OVERVIEW) {
        return;
      }

      if (testRun !== 0 && this.config.watch) {
        this.terminal.clear();
      }

      this.reportTestResults();
      this.reportTestProgress();
    });

    this.runner.on('test-run-finished', ({ testRun, testCoverage }) => {
      for (const reporter of this.config.reporters) {
        reporter.onTestRunFinished?.({ testRun });
      }

      if (this.activeMenu !== MENUS.OVERVIEW) {
        return;
      }

      this.testCoverage = testCoverage;
      if (testCoverage && !this.runner.focusedTestFile) {
        this.writeCoverageReport(testCoverage);
      }
      this.reportTestProgress();
    });

    this.runner.on('finished', () => {
      this.reportEnd();
    });
  }

  private focusTestFileNr(i: number) {
    const focusedTestFile =
      this.menuFailedFiles[i - 1] ??
      this.menuSucceededAndPendingFiles[i - this.menuFailedFiles.length - 1];
    const debug = this.activeMenu === MENUS.DEBUG_SELECT_FILE;

    if (focusedTestFile) {
      this.runner.focusedTestFile = focusedTestFile;
      this.switchMenu(MENUS.OVERVIEW);
      if (debug) {
        this.startDebugFocusedTestFile();
      }
    } else {
      this.terminal.clear();
      this.logSelectFilesMenu();
    }
  }

  private reportTestResults(forceReport = false) {
    const { focusedTestFile } = this.runner;
    const testFiles = focusedTestFile ? [focusedTestFile] : this.runner.testFiles;

    for (const testFile of testFiles) {
      this.reportTestResult(testFile, forceReport);
    }
  }

  private async reportTestResult(testFile: string, forceReport = false) {
    const testRun = this.runner.testRun;
    const sessionsForTestFile = Array.from(this.sessions.forTestFile(testFile));
    const allFinished = sessionsForTestFile.every(s => s.status === SESSION_STATUS.FINISHED);
    if (!allFinished) {
      // not all sessions for this file are finished
      return;
    }

    let reportedFiles = this.reportedFilesByTestRun.get(testRun);
    if (!reportedFiles) {
      reportedFiles = new Set();
      this.reportedFilesByTestRun.set(testRun, reportedFiles);
    }

    if (!forceReport && reportedFiles.has(testFile)) {
      // this was file was already reported
      return;
    }
    reportedFiles.add(testFile);

    const reportsPromises = this.getTestResultReports(testFile, testRun);
    for (const reportsPromise of reportsPromises) {
      this.pendingLogs.push(reportsPromise);
      reportsPromise
        .catch(error => {
          console.error(error);
        })
        .then(report => {
          this.pendingLogs.splice(this.pendingLogs.indexOf(reportsPromise), 1);
          // do the actual logging only if there is something to log, and if we're not
          // in a new test run (for example a file changed in watch mode)
          if (report && this.runner.testRun === testRun) {
            this.terminal.logStatic(report);
          }
        });
    }
  }

  private getTestResultReports(testFile: string, testRun: number) {
    const reports: Promise<Report | undefined>[] = [];

    for (const reporter of this.config.reporters) {
      const sessionsForTestFile = Array.from(this.sessions.forTestFile(testFile));
      const report = reporter.reportTestFileResult?.({
        sessionsForTestFile,
        testFile,
        testRun,
      });
      reports.push(Promise.resolve(report));
    }

    return reports;
  }

  private reportTestProgress(final = false) {
    const logStatic = this.config.staticLogging || !this.terminal.isInteractive;
    if (logStatic && !final) {
      return;
    }

    const reports: ReportEntry[] = [];
    for (const reporter of this.config.reporters) {
      const report = reporter.reportTestProgress?.({
        testRun: this.runner.testRun,
        focusedTestFile: this.runner.focusedTestFile,
        testCoverage: this.testCoverage,
      });

      if (report) {
        reports.push(...report);
      }
    }

    if (this.config.watch) {
      if (this.runner.focusedTestFile) {
        reports.push(
          `Focused on test file: ${chalk.cyanBright(
            path.relative(process.cwd(), this.runner.focusedTestFile),
          )}\n`,
        );
      }

      reports.push(...getWatchCommands(!!this.config.coverage, !!this.runner.focusedTestFile), '');
    }

    if (logStatic) {
      this.terminal.logStatic(reports);
    } else {
      this.terminal.logDynamic(reports);
    }
  }

  private writeCoverageReport(testCoverage: TestCoverage) {
    writeCoverageReport(testCoverage, this.config.coverageConfig!);
  }

  private switchMenu(menu: MenuType) {
    if (this.activeMenu === menu) {
      return;
    }
    this.activeMenu = menu;

    if (this.config.watch) {
      this.terminal.clear();
    }

    switch (menu) {
      case MENUS.OVERVIEW:
        this.reportTestResults(true);
        this.reportTestProgress();
        if (this.config.watch) {
          this.terminal.observeDirectInput();
        }
        break;
      case MENUS.FOCUS_SELECT_FILE:
      case MENUS.DEBUG_SELECT_FILE:
        this.logSelectFilesMenu();
        break;
      default:
        break;
    }
  }

  private async startDebugFocusedTestFile() {
    this.openingDebugBrowser = true;
    this.reportTestProgress();
    try {
      await this.runner.startDebugFocusedTestFile();
    } finally {
      this.openingDebugBrowser = false;
      this.reportTestProgress();
    }
  }

  private logSelectFilesMenu() {
    this.menuSucceededAndPendingFiles = [];
    this.menuFailedFiles = [];

    for (const testFile of this.runner.testFiles) {
      const sessions = Array.from(this.sessions.forTestFile(testFile));
      if (sessions.every(t => t.status === SESSION_STATUS.FINISHED && !t.passed)) {
        this.menuFailedFiles.push(testFile);
      } else {
        this.menuSucceededAndPendingFiles.push(testFile);
      }
    }

    const selectFilesEntries = getSelectFilesMenu(
      this.menuSucceededAndPendingFiles,
      this.menuFailedFiles,
    );

    this.terminal.logDynamic([]);
    this.terminal.logStatic(selectFilesEntries);
    this.terminal.logPendingUserInput(
      `Number of the file to ${this.activeMenu === MENUS.FOCUS_SELECT_FILE ? 'focus' : 'debug'}: `,
    );
    this.terminal.observeConfirmedInput();
  }

  private async reportEnd() {
    this.reportTestProgress(true);
    await Promise.all(this.pendingLogs);
    this.terminal.stop();
    this.runner.stop();
  }
}
