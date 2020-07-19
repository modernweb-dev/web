import { Reporter, ReporterConstructorArgs, TestSessionManager } from '@web/test-runner-core';
import { TestRunnerCoreConfig } from '@web/test-runner-core';
import { getTestFileReport } from './messages/getTestFileReport';
import {
  createSourceMapFunction,
  SourceMapFunction,
} from './messages/utils/createSourceMapFunction';
import { getTestProgressReport } from './messages/getTestProgress';

export class DefaultReporter implements Reporter {
  private config: TestRunnerCoreConfig;
  private sessions: TestSessionManager;
  private testFiles: string[];
  private browserNames: string[];
  private favoriteBrowser: string;
  private stackLocationRegExp: RegExp;
  private sourceMapFunction: SourceMapFunction;
  private startTime: number;

  constructor({ config, sessions, testFiles, browserNames, startTime }: ReporterConstructorArgs) {
    this.config = config;
    this.sessions = sessions;
    this.testFiles = testFiles;
    this.browserNames = browserNames;
    this.startTime = startTime;
    this.favoriteBrowser =
      this.browserNames.find(browserName => {
        const n = browserName.toLowerCase();
        return n.includes('chrome') || n.includes('chromium') || n.includes('firefox');
      }) ?? this.browserNames[0];
    this.stackLocationRegExp = new RegExp(
      `(\\(|@)(?:${config.protocol}:\\/\\/${config.hostname}:${config.port})*(.*\\.\\w{2,3}.*?)(?::(\\d+))?(?::(\\d+))?(\\)|$)`,
    );
    this.sourceMapFunction = createSourceMapFunction(config.protocol, config.hostname, config.port);
  }

  onTestRunStarted({ testRun }) {
    if (testRun !== 0) {
      // create a new source map function to clear the cached source maps
      this.sourceMapFunction = createSourceMapFunction(
        this.config.protocol,
        this.config.hostname,
        this.config.port,
      );
    }
  }

  async reportTestResult({ sessionsForTestFile, testFile, testRun }) {
    return getTestFileReport(
      testFile,
      this.browserNames,
      this.favoriteBrowser,
      this.config.rootDir,
      this.stackLocationRegExp,
      sessionsForTestFile,
      this.sourceMapFunction,
    );
  }

  reportTestProgress({ testRun, focusedTestFile, testCoverage }) {
    return getTestProgressReport(this.config, {
      browserNames: this.browserNames,
      testRun,
      testFiles: this.testFiles,
      sessions: this.sessions,
      startTime: this.startTime,
      focusedTestFile,
      watch: this.config.watch,
      coverage: !!this.config.coverage,
      coverageConfig: this.config.coverageConfig,
      testCoverage,
    });
  }
}
