import { TestRunnerCoreConfig } from '../config/TestRunnerCoreConfig.js';
import { createTestSessions } from './createSessionGroups.js';
import { TestSession } from '../test-session/TestSession.js';
import { getTestCoverage, TestCoverage } from '../coverage/getTestCoverage.js';
import { TestScheduler } from './TestScheduler.js';
import { TestSessionManager } from '../test-session/TestSessionManager.js';
import { SESSION_STATUS } from '../test-session/TestSessionStatus.js';
import { EventEmitter } from '../utils/EventEmitter.js';
import { createSessionUrl } from './createSessionUrl.js';
import { createDebugSessions } from './createDebugSessions.js';
import { TestRunnerServer } from '../server/TestRunnerServer.js';
import { BrowserLauncher } from '../browser-launcher/BrowserLauncher.js';
import { TestRunnerGroupConfig } from '../config/TestRunnerGroupConfig.js';

interface EventMap {
  'test-run-started': { testRun: number };
  'test-run-finished': { testRun: number; testCoverage?: TestCoverage };
  finished: boolean;
  stopped: boolean;
}

export class TestRunner extends EventEmitter<EventMap> {
  public config: TestRunnerCoreConfig;
  public sessions: TestSessionManager;
  public testFiles: string[];
  public browsers: BrowserLauncher[];
  public browserNames: string[];
  public startTime = -1;
  public testRun = -1;
  public started = false;
  public stopped = false;
  public running = false;
  public passed = false;
  public focusedTestFile: string | undefined;

  private scheduler: TestScheduler;
  private server: TestRunnerServer;
  private pendingSessions = new Set<TestSession>();

  constructor(config: TestRunnerCoreConfig, groupConfigs: TestRunnerGroupConfig[] = []) {
    super();
    if (!config.manual && (!config.browsers || config.browsers.length === 0)) {
      throw new Error('No browsers are configured to run tests');
    }

    if (config.manual && config.watch) {
      throw new Error('Cannot combine the manual and watch options.');
    }

    if (config.open && !config.manual) {
      throw new Error('The open option requires the manual option to be set.');
    }

    const { sessionGroups, testFiles, testSessions, browsers } = createTestSessions(
      config,
      groupConfigs,
    );
    this.config = config;

    this.testFiles = testFiles;
    this.browsers = browsers;
    this.browserNames = Array.from(new Set(this.browsers.map(b => b.name)));
    this.browserNames.sort(
      (a, b) =>
        this.browsers.findIndex(br => br.name === a) - this.browsers.findIndex(br => br.name === b),
    );

    this.sessions = new TestSessionManager(sessionGroups, testSessions);
    this.scheduler = new TestScheduler(config, this.sessions, browsers);
    this.server = new TestRunnerServer(
      this.config,
      this,
      this.sessions,
      this.testFiles,
      sessions => {
        this.runTests(sessions);
      },
    );
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

      await this.server.start();

      if (!this.config.manual) {
        for (const browser of this.browsers) {
          if (browser.initialize) {
            await browser.initialize(this.config, this.testFiles);
          }
        }

        // the browser names can be updated after initialize
        this.browserNames = Array.from(new Set(this.browsers.map(b => b.name)));
        this.runTests(this.sessions.all());
      }
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

      this.scheduler.schedule(this.testRun, sessionsToRun);
      this.emit('test-run-started', { testRun: this.testRun });
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
    await this.scheduler.stop();

    const stopActions = [];
    const stopServerAction = this.server.stop().catch(error => {
      console.error(error);
    });
    stopActions.push(stopServerAction);

    if (this.config.watch) {
      // we only need to stop the browsers in watch mode, in non-watch
      // mode the scheduler has already stopped them
      const stopActions = [];
      for (const browser of this.browsers) {
        if (browser.stop) {
          stopActions.push(
            browser.stop().catch(error => {
              console.error(error);
            }),
          );
        }
      }
    }
    await Promise.all(stopActions);
    this.emit('stopped', this.passed);
  }

  startDebugBrowser(testFile: string) {
    const sessions = this.sessions.forTestFile(testFile);
    const debugSessions = createDebugSessions(Array.from(sessions));
    this.sessions.addDebug(...debugSessions);

    for (const session of debugSessions) {
      session.browser
        .startDebugSession(session.id, createSessionUrl(this.config, session))
        .catch(error => {
          console.error(error);
        });
    }
  }

  private async onSessionFinished() {
    try {
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
