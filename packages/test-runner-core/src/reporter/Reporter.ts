import { TestSession } from '../test-session/TestSession';
import { TestSessionManager } from '../test-session/TestSessionManager';
import { TestRunnerCoreConfig } from '../runner/TestRunnerCoreConfig';
import { TestCoverage } from '../coverage/getTestCoverage';

export interface IndentedReport {
  text: string;
  indent: number;
}

export type Report = (string | IndentedReport)[];

export interface ReporterConstructorArgs {
  config: TestRunnerCoreConfig;
  sessions: TestSessionManager;
  testFiles: string[];
  browserNames: string[];
  options?: unknown;
  startTime: number;
}

interface ReportTestFileResultsArgs {
  sessionsForTestFile: TestSession[];
  testFile: string;
  testRun: number;
}

interface ReportTestProgressArgs {
  testRun: number;
  focusedTestFile?: string;
  testCoverage?: TestCoverage;
}

interface TestRunArgs {
  testRun: number;
}

interface OnFinishedArgs {
  testCoverage?: TestCoverage;
}

export interface ReporterConstructor {}

export interface Reporter {
  reportTestFileResult?(args: ReportTestFileResultsArgs): Report | void | undefined;
  reportTestProgress?(args: ReportTestProgressArgs): Report | void | undefined;
  onTestRunStarted?(args: TestRunArgs): void;
  onTestRunFinished?(args: TestRunArgs): void;
  onFinished?(args: OnFinishedArgs): void | undefined;
}
