import { resolve } from 'path';

import { TestRunnerCoreConfig } from '../config/TestRunnerCoreConfig';
import { createTestSessions } from './createTestSessions';
import { TestSession } from '../test-session/TestSession';
import { BrowserLauncher } from '../browser-launcher/BrowserLauncher';
import { getTestCoverage, TestCoverage } from '../coverage/getTestCoverage';
import { TestScheduler } from './TestScheduler';
import { TestSessionManager } from '../test-session/TestSessionManager';
import { SESSION_STATUS } from '../test-session/TestSessionStatus';
import { EventEmitter } from '../utils/EventEmitter';
import { createSessionUrl } from './createSessionUrl';
import { CoverageMapData } from 'istanbul-lib-coverage';

interface EventMap {
  'test-run-started': { testRun: number; sessions: Iterable<TestSession> };
  'test-run-finished': { testRun: number; testCoverage?: TestCoverage };
  finished: boolean;
  stopped: boolean;
}

export class TestRunner extends EventEmitter<EventMap> {
  public config: TestRunnerCoreConfig;
  public sessions = new TestSessionManager();
  public browserNames: string[] = [];
  public testFiles: string[];
  public startTime = -1;
  public testRun = -1;
  public started = false;
  public stopped = false;
  public running = false;
  public passed = false;
  public focusedTestFile: string | undefined;

  private browserLaunchers: BrowserLauncher[];
  private scheduler: TestScheduler;
  private pendingSessions = new Set<TestSession>();

  constructor(config: TestRunnerCoreConfig, testFiles: string[]) {
    super();
    this.config = config;
    this.testFiles = testFiles.map(f => resolve(f));
    this.browserLaunchers = Array.isArray(config.browsers) ? config.browsers : [config.browsers];
    this.scheduler = new TestScheduler(config, this.sessions);

    this.sessions.on('session-status-updated', session => {
      if (session.status === SESSION_STATUS.FINISHED) {
        this.onSessionFinished();
      }
    });
  }

  async start() {
    try {
      if (this.started) {
        throw new Error('Cannot start twice.');
      }

      this.started = true;
      this.startTime = Date.now();

      const browserNameForLauncher = new Map<BrowserLauncher, string>();
      this.browserNames = [];

      for (const launcher of this.browserLaunchers) {
        const name = await launcher.start(this.config, this.testFiles);
        this.browserNames.push(name);
        browserNameForLauncher.set(launcher, name);
      }

      const createdSessions = createTestSessions(browserNameForLauncher, this.testFiles);

      for (const session of createdSessions) {
        this.sessions.add(session);
      }

      await this.config.server.start({
        config: this.config,
        sessions: this.sessions,
        runner: this,
        testFiles: this.testFiles,
      });

      this.runTests(this.sessions.all());
    } catch (error) {
      this.stop(error);
    }
  }

  async runTests(sessions: Iterable<TestSession>) {
    if (this.stopped) {
      return;
    }

    if (this.running) {
      for (const session of sessions) {
        this.pendingSessions.add(session);
      }
      return;
    }

    const sessionsToRun = this.focusedTestFile
      ? Array.from(sessions).filter(f => f.testFile === this.focusedTestFile)
      : [...sessions, ...this.pendingSessions];
    this.pendingSessions.clear();

    if (sessionsToRun.length === 0) {
      return;
    }

    try {
      this.testRun += 1;
      this.running = true;

      await this.scheduler.schedule(this.testRun, sessionsToRun);
      this.emit('test-run-started', { testRun: this.testRun, sessions: sessionsToRun });
    } catch (error) {
      this.running = false;
      this.stop(error);
    }
  }

  async stop(error?: any) {
    if (error instanceof Error) {
      console.error('Error while running tests:');
      console.error(error);
      console.error('');
    }

    if (this.stopped) {
      return;
    }

    this.stopped = true;
    this.scheduler.stop();
    this.config.server.stop().catch(error => {
      console.error(error);
    });

    const stopActions = [];
    for (const browser of this.browserLaunchers) {
      stopActions.push(
        browser.stop().catch(error => {
          console.error(error);
        }),
      );
    }
    await Promise.all(stopActions);
    this.emit('stopped', this.passed);
  }

  startDebugBrowser(testFile: string) {
    for (const session of this.sessions.forTestFile(testFile)) {
      session.browserLauncher
        .startDebugSession(session, createSessionUrl(this.config, session, true))
        .catch(error => {
          console.error(error);
        });
    }
  }

  private async onSessionFinished() {
    try {
      this.scheduler.runScheduled(this.testRun);

      const finishedAll = Array.from(this.sessions.all()).every(
        s => s.status === SESSION_STATUS.FINISHED,
      );

      if (finishedAll) {
        let passedCoverage = true;
        let testCoverage: TestCoverage | undefined = undefined;
        if (this.config.coverage) {
          testCoverage = getTestCoverage(this.sessions.all(), this.config.coverageConfig);
          passedCoverage = testCoverage.passed;
        }

        setTimeout(() => {
          // emit finished event after a timeout to ensure all event listeners have processed
          // the session status updated event
          this.emit('test-run-finished', { testRun: this.testRun, testCoverage });

          this.running = false;
          if (this.pendingSessions) {
            this.runTests(this.pendingSessions);
          }
        });

        if (!this.config.watch) {
          setTimeout(async () => {
            this.passed = passedCoverage && Array.from(this.sessions.failed()).length === 0;
            this.emit('finished', this.passed);
          });
        }
      }
    } catch (error) {
      this.stop(error);
    }
  }
}
