import { TestSession } from '../test-session/TestSession';
import { TestSessionManager } from '../test-session/TestSessionManager';
import { TestRunnerCoreConfig } from '../config/TestRunnerCoreConfig';
import { TestCoverage } from '../coverage/getTestCoverage';
import { Logger } from '../logger/Logger';
import { BrowserLauncher } from '../browser-launcher/BrowserLauncher';

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
