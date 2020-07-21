import { TestSession } from '../test-session/TestSession';
import { TestSessionManager } from '../test-session/TestSessionManager';
import { TestRunnerCoreConfig } from '../config/TestRunnerCoreConfig';
import { TestCoverage } from '../coverage/getTestCoverage';

export interface IndentedReportEntry {
  text: string;
  indent: number;
}

export type ReportEntry = string | IndentedReportEntry;

export type Report = ReportEntry[] | undefined | void;

export interface ReporterArgs {
  config: TestRunnerCoreConfig;
  sessions: TestSessionManager;
  testFiles: string[];
  browserNames: string[];
  startTime: number;
}

export interface ReportTestResultsArgs {
  sessionsForTestFile: TestSession[];
  testFile: string;
  testRun: number;
}

export interface ReportTestProgressArgs {
  testRun: number;
  focusedTestFile?: string;
  testCoverage?: TestCoverage;
}

export interface TestRunArgs {
  testRun: number;
}

export interface TestRunStartedArgs extends TestRunArgs {}
export interface TestRunFinishedArgs extends TestRunArgs {}

export interface ReporterConstructor {}

export interface Reporter {
  reportTestFileResult?(args: ReportTestResultsArgs): Report | Promise<Report>;
  reportTestProgress?(args: ReportTestProgressArgs): Report;
  onTestRunStarted?(args: TestRunStartedArgs): void;
  onTestRunFinished?(args: TestRunFinishedArgs): void;
  start?(args: ReporterArgs): void | undefined;
  stop?(): void | undefined;
}
