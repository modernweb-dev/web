import { TestRunnerConfig } from './TestRunnerConfig';
import { createTestSessions } from './createTestSessions';
import { TestSession } from '../test-session/TestSession';
import { BrowserLauncher } from '../browser-launcher/BrowserLauncher';
import { getTestCoverage, TestCoverage } from '../coverage/getTestCoverage';
import { TestScheduler } from './TestScheduler';
import { TestSessionManager } from '../test-session/TestSessionManager';
import { SESSION_STATUS } from '../test-session/TestSessionStatus';
import { EventEmitter } from '../utils/EventEmitter';
import { createSessionUrl } from './createSessionUrl';

interface EventMap {
  'test-run-started': { testRun: number; sessions: Iterable<TestSession> };
  'test-run-finished': { testRun: number; testCoverage?: TestCoverage };
  quit: boolean;
}

export class TestRunner extends EventEmitter<EventMap> {
  public config: TestRunnerConfig;
  public sessions = new TestSessionManager();
  public browserNames: string[] = [];
  public testFiles: string[];
  public favoriteBrowser = '';
  public startTime = -1;
  public testRun = -1;
  public started = false;
  public stopped = false;
  public focusedTestFile: string | undefined;

  private browserLaunchers: BrowserLauncher[];
  private scheduler: TestScheduler;

  constructor(config: TestRunnerConfig, testFiles: string[]) {
    super();
    this.config = config;
    this.testFiles = testFiles;
    this.browserLaunchers = Array.isArray(config.browsers) ? config.browsers : [config.browsers];
    this.scheduler = new TestScheduler(config, this.sessions);

    this.sessions.on('session-status-updated', session => {
      if (session.status === SESSION_STATUS.FINISHED) {
        this.onSessionFinished(session);
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

      const browserNamesPerLauncher = new Map<BrowserLauncher, string[]>();
      this.browserNames = [];

      for (const launcher of this.browserLaunchers) {
        const names = await launcher.start(this.config);
        if (!Array.isArray(names) || names.length === 0 || names.some(n => typeof n !== 'string')) {
          throw new Error('Browser start must return an array of strings.');
        }

        for (const name of names) {
          if (this.browserNames.includes(name)) {
            throw new Error(`Multiple browser launchers return the same browser name ${name}`);
          }
          this.browserNames.push(name);
        }
        browserNamesPerLauncher.set(launcher, names);
      }

      this.favoriteBrowser =
        this.browserNames.find(browserName => {
          const n = browserName.toLowerCase();
          return n.includes('chrome') || n.includes('chromium') || n.includes('firefox');
        }) ?? this.browserNames[0];

      const createdSessions = createTestSessions(browserNamesPerLauncher, this.testFiles);

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
      this.quit(error);
    }
  }

  async runTests(sessions: Iterable<TestSession>) {
    if (this.stopped) {
      return;
    }

    const sessionsToRun = this.focusedTestFile
      ? Array.from(sessions).filter(f => f.testFile === this.focusedTestFile)
      : Array.from(sessions);
    if (sessionsToRun.length === 0) {
      return;
    }

    try {
      this.testRun += 1;

      await this.scheduler.schedule(this.testRun, sessionsToRun);
      this.emit('test-run-started', { testRun: this.testRun, sessions: sessionsToRun });
    } catch (error) {
      this.quit(error);
    }
  }

  async stop() {
    if (this.stopped) {
      return;
    }

    this.stopped = true;
    this.scheduler.stop();
    this.config.server.stop().catch(error => {
      console.error(error);
    });

    for (const browser of this.browserLaunchers) {
      browser.stop().catch(error => {
        console.error(error);
      });
    }
  }

  startDebugFocusedTestFile() {
    if (!this.focusedTestFile) {
      throw new Error('Cannot debug without a focused test file.');
    }

    const startPromises: Promise<void>[] = [];

    for (const session of this.sessions.forTestFile(this.focusedTestFile)) {
      startPromises.push(
        session.browserLauncher
          .startDebugSession(session, createSessionUrl(this.config, session, true))
          .catch(error => {
            console.error(error);
          }),
      );
    }
    return Promise.all(startPromises);
  }

  async quit(error?: any) {
    if (error instanceof Error) {
      console.error('Error while running tests:');
      console.error(error);
      console.error('');
    }

    await this.stop();
    this.emit('quit', false);
  }

  private async onSessionFinished(session: TestSession) {
    try {
      session.browserLauncher.stopSession(session);

      this.scheduler.runScheduled(this.testRun).catch(error => {
        this.quit(error);
      });

      const finishedAll = Array.from(this.sessions.all()).every(
        s => s.status === SESSION_STATUS.FINISHED,
      );
      if (finishedAll) {
        let passedCoverage = true;
        let testCoverage: TestCoverage | undefined = undefined;
        if (this.config.coverage) {
          testCoverage = getTestCoverage(
            this.sessions.all(),
            this.config.coverageConfig!.threshold,
          );
          passedCoverage = testCoverage.passed;
        }

        this.emit('test-run-finished', { testRun: this.testRun, testCoverage });

        if (!this.config.watch) {
          setTimeout(async () => {
            await this.stop();

            const passed = passedCoverage && Array.from(this.sessions.failed()).length === 0;
            this.emit('quit', passed);
          });
        }
      }
    } catch (error) {
      this.quit(error);
    }
  }
}
