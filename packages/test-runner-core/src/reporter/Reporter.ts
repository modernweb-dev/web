import { type TestSession } from '../test-session/TestSession.ts';
import { TestSessionManager } from '../test-session/TestSessionManager.ts';
import { type TestRunnerCoreConfig } from '../config/TestRunnerCoreConfig.ts';
import { type TestCoverage } from '../coverage/getTestCoverage.ts';
import { type Logger } from '../logger/Logger.ts';
import { type BrowserLauncher } from '../browser-launcher/BrowserLauncher.ts';

export interface ReporterArgs {
  config: TestRunnerCoreConfig;
  sessions: TestSessionManager;
  browsers: BrowserLauncher[];
  browserNames: string[];
  testFiles: string[];
  startTime: number;
}

export interface ReportTestResultsArgs {
  logger: Logger;
  sessionsForTestFile: TestSession[];
  testFile: string;
  testRun: number;
}

export interface GetTestProgressArgs {
  sessions: TestSession[];
  testRun: number;
  focusedTestFile?: string;
  testCoverage?: TestCoverage;
}

export interface TestRunArgs {
  testRun: number;
}

export interface TestRunStartedArgs extends TestRunArgs {}
export interface TestRunFinishedArgs extends TestRunArgs {
  sessions: TestSession[];
  testCoverage?: TestCoverage;
  focusedTestFile?: string;
}

export interface StopArgs {
  sessions: TestSession[];
  testCoverage?: TestCoverage;
  focusedTestFile?: string;
}

export interface ReporterConstructor {}

export interface Reporter {
  reportTestFileResults?(args: ReportTestResultsArgs): void;
  getTestProgress?(args: GetTestProgressArgs): string | string[];
  onTestRunStarted?(args: TestRunStartedArgs): void;
  onTestRunFinished?(args: TestRunFinishedArgs): void;
  start?(args: ReporterArgs): void | Promise<void>;
  stop?(args: StopArgs): void | Promise<void>;
}
