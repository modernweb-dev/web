import { codeFrameColumns } from '@babel/code-frame';
import path from 'path';
import { bold, cyan, red } from 'nanocolors';
import openBrowser from 'open';

import { writeCoverageReport } from './writeCoverageReport.js';
import { getSelectFilesMenu } from './getSelectFilesMenu.js';
import { getWatchCommands } from './getWatchCommands.js';
import { DynamicTerminal } from './terminal/DynamicTerminal.js';
import { BufferedLogger } from './BufferedLogger.js';
import { getManualDebugMenu } from './getManualDebugMenu.js';
import { ErrorWithLocation } from '../logger/Logger.js';
import { TestRunnerCoreConfig } from '../config/TestRunnerCoreConfig.js';
import { TestSessionManager } from '../test-session/TestSessionManager.js';
import { SESSION_STATUS } from '../test-session/TestSessionStatus.js';
import { Logger } from '../logger/Logger.js';
import { TestRunner } from '../runner/TestRunner.js';
import { TestCoverage } from '../coverage/getTestCoverage.js';

export type MenuType = 'none' | 'overview' | 'focus' | 'debug' | 'manual-debug';

export const MENUS = {
  NONE: 'none' as MenuType,
  OVERVIEW: 'overview' as MenuType,
  FOCUS_SELECT_FILE: 'focus' as MenuType,
  DEBUG_SELECT_FILE: 'debug' as MenuType,
  MANUAL_DEBUG: 'manual-debug' as MenuType,
};

const KEYCODES = {
  ENTER: '\r',
  ESCAPE: '\u001b',
  CTRL_C: '\u0003',
  CTRL_D: '\u0004',
};

export class TestRunnerCli {
  private config: TestRunnerCoreConfig;
  private runner: TestRunner;
  private terminal = new DynamicTerminal();
  private reportedFilesByTestRun = new Map<number, Set<string>>();
  private sessions: TestSessionManager;
  private activeMenu: MenuType = MENUS.NONE;
  private menuSucceededAndPendingFiles: string[] = [];
  private menuFailedFiles: string[] = [];
  private testCoverage?: TestCoverage;
  private pendingReportPromises: Promise<any>[] = [];
  private logger: Logger;
  private localAddress: string;
  private lastStaticLog = -1;

  constructor(config: TestRunnerCoreConfig, runner: TestRunner) {
    this.config = config;
    this.runner = runner;
    this.logger = this.config.logger;
    this.sessions = runner.sessions;
    this.localAddress = `${this.config.protocol}//${this.config.hostname}:${this.config.port}/`;

    if (config.watch && !this.terminal.isInteractive) {
      this.runner.stop(new Error('Cannot run watch mode in a non-interactive (TTY) terminal.'));
    }
  }

  start() {
    this.setupTerminalEvents();
    this.setupRunnerEvents();

    this.terminal.start();

    for (const reporter of this.config.reporters) {
      reporter.start?.({
        config: this.config,
        sessions: this.sessions,
        testFiles: this.runner.testFiles,
        startTime: this.runner.startTime,
        browsers: this.runner.browsers,
        browserNames: this.runner.browserNames,
      });
    }

    this.switchMenu(this.config.manual ? MENUS.MANUAL_DEBUG : MENUS.OVERVIEW);

    if (this.config.watch || (this.config.manual && this.terminal.isInteractive)) {
      this.terminal.observeDirectInput();
    }

    if (this.config.staticLogging || !this.terminal.isInteractive) {
      this.logger.log(bold(`Running ${this.runner.testFiles.length} test files...\n`));
    }

    if (this.config.open) {
      openBrowser(this.localAddress);
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
          if (
            this.activeMenu === MENUS.OVERVIEW ||
            (this.config.manual && this.activeMenu === MENUS.MANUAL_DEBUG)
          ) {
            this.runner.stop();
          }
          return;
        case 'D':
          if (this.activeMenu === MENUS.OVERVIEW) {
            if (this.runner.focusedTestFile) {
              this.runner.startDebugBrowser(this.runner.focusedTestFile);
            } else if (this.runner.testFiles.length === 1) {
              this.runner.startDebugBrowser(this.runner.testFiles[0]);
            } else {
              this.switchMenu(MENUS.DEBUG_SELECT_FILE);
            }
          } else if (this.activeMenu === MENUS.MANUAL_DEBUG) {
            openBrowser(this.localAddress);
          }
          return;
        case 'F':
          if (this.activeMenu === MENUS.OVERVIEW && this.runner.testFiles.length > 1) {
            this.switchMenu(MENUS.FOCUS_SELECT_FILE);
          }
          return;
        case 'C':
          if (this.activeMenu === MENUS.OVERVIEW && this.config.coverage) {
            openBrowser(
              `file://${path.resolve(
                this.config.coverageConfig!.reportDir ?? '',
                'lcov-report',
                'index.html',
              )}`,
            );
          }
          return;
        case 'M':
          this.switchMenu(MENUS.MANUAL_DEBUG);
          return;
        case KEYCODES.ESCAPE:
          if (this.activeMenu === MENUS.OVERVIEW && this.runner.focusedTestFile) {
            this.runner.focusedTestFile = undefined;
            this.reportTestResults(true);
            this.reportTestProgress();
          } else if (this.activeMenu === MENUS.MANUAL_DEBUG) {
            this.switchMenu(MENUS.OVERVIEW);
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
      this.reportTestProgress(false);
    });

    this.runner.on('test-run-finished', ({ testRun, testCoverage }) => {
      for (const reporter of this.config.reporters) {
        reporter.onTestRunFinished?.({
          testRun,
          sessions: Array.from(this.sessions.all()),
          testCoverage,
          focusedTestFile: this.runner.focusedTestFile,
        });
      }

      if (this.activeMenu !== MENUS.OVERVIEW) {
        return;
      }

      this.testCoverage = testCoverage;
      if (testCoverage && !this.runner.focusedTestFile) {
        this.writeCoverageReport(testCoverage);
      }
      this.reportSyntaxErrors();
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
        this.runner.startDebugBrowser(focusedTestFile);
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

  private reportTestResult(testFile: string, forceReport = false) {
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

    const bufferedLogger = new BufferedLogger(this.logger);
    for (const reporter of this.config.reporters) {
      const sessionsForTestFile = Array.from(this.sessions.forTestFile(testFile));
      reporter.reportTestFileResults?.({
        logger: bufferedLogger,
        sessionsForTestFile,
        testFile,
        testRun,
      });
    }

    // all the logs from the reportered were buffered, if they finished before a new test run
    // actually log them to the terminal here
    if (this.runner.testRun === testRun) {
      bufferedLogger.logBufferedMessages();
    }
  }

  private reportTestProgress(final = false) {
    if (this.config.manual) {
      return;
    }

    const logStatic = this.config.staticLogging || !this.terminal.isInteractive;
    if (logStatic && !final) {
      // print a static progress log only once every 10000ms
      const now = Date.now();
      if (this.lastStaticLog !== -1 && now - this.lastStaticLog < 10000) {
        return;
      }
      this.lastStaticLog = now;
    }

    const reports: string[] = [];
    for (const reporter of this.config.reporters) {
      const report = reporter.getTestProgress?.({
        sessions: Array.from(this.sessions.all()),
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
          `Focused on test file: ${cyan(
            path.relative(process.cwd(), this.runner.focusedTestFile),
          )}\n`,
        );
      }

      reports.push(
        ...getWatchCommands(
          !!this.config.coverage,
          this.runner.testFiles,
          !!this.runner.focusedTestFile,
        ),
        '',
      );
    }

    if (logStatic) {
      this.terminal.logStatic(reports);
    } else {
      this.terminal.logDynamic(reports);
    }
  }

  private reportSyntaxErrors() {
    // TODO: this special cases the logger of @web/test-runner which implements
    // logging of syntax errors. we need to make this more generic
    const logger = this.config.logger as {
      loggedSyntaxErrors?: Map<string, ErrorWithLocation>;
      clearLoggedSyntaxErrors?: () => void;
    } & Logger;
    const { loggedSyntaxErrors = new Map() } = logger as any;
    if (loggedSyntaxErrors.size === 0) {
      return;
    }

    const report: string[] = [];
    logger.clearLoggedSyntaxErrors?.();

    for (const [filePath, errors] of loggedSyntaxErrors.entries()) {
      for (const error of errors) {
        const { message, code, line, column } = error;
        const result = codeFrameColumns(code, { start: { line, column } }, { highlightCode: true });
        const relativePath = path.relative(process.cwd(), filePath);
        report.push(red(`Error while transforming ${cyan(relativePath)}: ${message}`));
        report.push(result);
        report.push('');
      }
    }

    this.terminal.logStatic(report);
  }

  private writeCoverageReport(testCoverage: TestCoverage) {
    writeCoverageReport(testCoverage, this.config.coverageConfig);
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
      case MENUS.MANUAL_DEBUG:
        this.logManualDebugMenu();
        break;
      default:
        break;
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

  logManualDebugMenu() {
    this.terminal.logDynamic(getManualDebugMenu(this.config));
  }

  private async reportEnd() {
    for (const reporter of this.config.reporters) {
      await reporter.stop?.({
        sessions: Array.from(this.sessions.all()),
        testCoverage: this.testCoverage,
        focusedTestFile: this.runner.focusedTestFile,
      });
    }
    this.reportTestProgress(true);
    this.terminal.stop();
    this.runner.stop();
  }
}
