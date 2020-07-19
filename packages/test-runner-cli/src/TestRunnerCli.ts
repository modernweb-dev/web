import {
  TestRunnerCoreConfig,
  TestSessionManager,
  TestRunner,
  TestCoverage,
  SESSION_STATUS,
} from '@web/test-runner-core';
import chalk from 'chalk';
import path from 'path';
import openBrowser from 'open';
import { getTestProgressReport } from './messages/getTestProgress';
import { Terminal, TerminalEntry } from './Terminal';
import { getTestFileReport } from './messages/getTestFileReport';
import { getWatchCommands } from './messages/getWatchCommands';
import { getSelectFilesMenu } from './messages/getSelectFilesMenu';
import { writeCoverageReport } from './messages/writeCoverageReport';

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

// Prevent duplicate test file reports:
// const sessionsForTestFile = Array.from(this.sessions.forTestFile(testFile));
// const allFinished = sessionsForTestFile.every(s => s.status === SESSION_STATUS.FINISHED);
// if (!allFinished) {
//   return;
// }

// let reportedFiles = this.reportedFilesByTestRun.get(testRun);
// if (!reportedFiles) {
//   reportedFiles = new Set();
//   this.reportedFilesByTestRun.set(testRun, reportedFiles);
// }

// Report test progress, decide if static or dynamic:
// const logStatic = this.config.staticLogging || !this.terminal.isInteractive;
// if (logStatic && !final) {
//   return;
// }

// Render test progress stuff:

// if (this.runner.focusedTestFile) {
//   entries.push(
//     `Focused on test file: ${chalk.cyanBright(
//       path.relative(process.cwd(), this.runner.focusedTestFile),
//     )}\n`,
//   );
// }

// if (this.config.watch) {
//   entries.push(...getWatchCommands(!!this.config.coverage, !!this.runner.focusedTestFile), '');
// }

// if (logStatic) {
//   this.terminal.logStatic(entries);
// } else {
//   this.terminal.logDynamic(entries);
// }

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
    this.logTestResults();
    this.logTestProgress();
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
            this.logTestResults(true);
            this.logTestProgress();
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
        this.logTestResult(session.testFile);
        this.logTestProgress();
      }
    });

    this.runner.on('test-run-started', ({ testRun }) => {
      if (this.activeMenu !== MENUS.OVERVIEW) {
        return;
      }

      if (testRun !== 0 && this.config.watch) {
        this.terminal.clear();
      }

      this.logTestResults();
      this.logTestProgress();
    });

    this.runner.on('test-run-finished', ({ testCoverage }) => {
      if (this.activeMenu !== MENUS.OVERVIEW) {
        return;
      }

      this.testCoverage = testCoverage;
      if (testCoverage && !this.runner.focusedTestFile) {
        this.writeCoverageReport(testCoverage);
      }
      this.logTestProgress();
    });

    this.runner.on('finished', () => {
      this.reportEnd();
    });
  }

  private logTestResults(force = false) {
    const { testFiles, focusedTestFile } = this.runner;

    if (focusedTestFile) {
      this.logTestResult(focusedTestFile, force);
    } else {
      for (const testFile of testFiles) {
        this.logTestResult(testFile, force);
      }
    }
  }

  private focusTestFileNr(i: number) {
    const focusedTestFile =
      this.menuFailedFiles[i - 1] ??
      this.menuSucceededAndPendingFiles[i - this.menuFailedFiles.length - 1];
    const debug = this.activeMenu === MENUS.DEBUG_SELECT_FILE;

    if (focusedTestFile) {
      this.runner.focusedTestFile = focusedTestFile;
      if (debug) {
        this.startDebugFocusedTestFile();
      }
      this.switchMenu(MENUS.OVERVIEW);
    } else {
      this.terminal.clear();
      this.logSelectFilesMenu();
    }
  }

  private async reportTestResult({ sessions, session, testRun }) {
    const logPromise = this.getTestFileReport(testFile, force);
    this.pendingLogs.push(logPromise);
    logPromise
      .catch(error => {
        console.error(error);
      })
      .then(report => {
        this.pendingLogs.splice(this.pendingLogs.indexOf(logPromise), 1);
        // do the actual logging only if there is something to log, and if we're not
        // in a new test run (for example a file changed in watch mode)
        if (report && this.runner.testRun === forTestRun) {
          this.terminal.logStatic(report);
        }
      });
    return logPromise;
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
        this.logTestResults(true);
        this.logTestProgress();
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
    this.logTestProgress();
    try {
      await this.runner.startDebugFocusedTestFile();
    } finally {
      this.openingDebugBrowser = false;
      this.logTestProgress();
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
    this.logTestProgress(true);
    await Promise.all(this.pendingLogs);
    this.terminal.stop();
    this.runner.stop();
  }
}
