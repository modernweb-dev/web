import { TestSession } from '../test-session/TestSession';
import { TestSessionManager } from '../test-session/TestSessionManager';
import { TestRunnerCoreConfig } from '../config/TestRunnerCoreConfig';
import { TestCoverage } from '../coverage/getTestCoverage';
import { Logger } from '../logger/Logger';

export interface ReporterArgs {
  config: TestRunnerCoreConfig;
  sessions: TestSessionManager;
  testFiles: string[];
  browserNames: string[];
  startTime: number;
}

export interface ReportTestResultsArgs {
  logger: Logger;
  sessionsForTestFile: TestSession[];
  testFile: string;
  testRun: number;
}

export interface GetTestProgressArgs {
  config: TestRunnerCoreConfig;
  sessions: TestSession[];
  startTime: number;
  testRun: number;
  focusedTestFile?: string;
  testCoverage?: TestCoverage;
  testFiles: string[];
}

export interface TestRunArgs {
  testRun: number;
}

export interface TestRunStartedArgs extends TestRunArgs {}
export interface TestRunFinishedArgs extends TestRunArgs {}

export interface ReporterConstructor {}

export interface Reporter {
  reportTestFileResults?(args: ReportTestResultsArgs): void | Promise<void>;
  getTestProgress?(args: GetTestProgressArgs): string | string[];
  onTestRunStarted?(args: TestRunStartedArgs): void;
  onTestRunFinished?(args: TestRunFinishedArgs): void;
  start?(args: ReporterArgs): void | undefined;
  stop?(): void | undefined;
}
