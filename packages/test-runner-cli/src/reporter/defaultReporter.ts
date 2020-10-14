import { Logger, Reporter, ReporterArgs } from '@web/test-runner-core';

import { createSourceMapFunction, SourceMapFunction } from '../utils/createSourceMapFunction';
import { reportTestFileResults } from './reportTestFileResults';
import { getTestProgressReport } from './getTestProgress';
import { BufferedLogger } from './BufferedLogger';
import { createStackLocationRegExp } from '../utils/createStackLocationRegExp';

export interface DefaultReporterArgs {
  reportTestResults?: boolean;
  reportTestProgress?: boolean;
}

function isBufferedLogger(logger: Logger): logger is BufferedLogger {
  return (
    typeof (logger as any).logBufferedMessages === 'function' &&
    Array.isArray((logger as any).buffer)
  );
}

export function defaultReporter({
  reportTestResults = true,
  reportTestProgress = true,
}: DefaultReporterArgs = {}): Reporter {
  let args: ReporterArgs;
  let favoriteBrowser: string;
  let stackLocationRegExp: RegExp;
  let sourceMapFunction: SourceMapFunction;

  return {
    start(_args) {
      args = _args;
      favoriteBrowser =
        args.browserNames.find(name => {
          const n = name.toLowerCase();
          return n.includes('chrome') || n.includes('chromium') || n.includes('firefox');
        }) ?? args.browserNames[0];
      stackLocationRegExp = createStackLocationRegExp(
        args.config.protocol,
        args.config.hostname,
        args.config.port,
      );
      sourceMapFunction = createSourceMapFunction(
        args.config.protocol,
        args.config.hostname,
        args.config.port,
      );
    },

    onTestRunStarted({ testRun }) {
      if (testRun !== 0) {
        // create a new source map function to clear the cached source maps
        sourceMapFunction = createSourceMapFunction(
          args.config.protocol,
          args.config.hostname,
          args.config.port,
        );
      }
    },

    async reportTestFileResults({ logger, sessionsForTestFile, testFile }) {
      if (!reportTestResults) {
        return undefined;
      }

      if (!isBufferedLogger(logger)) {
        throw new Error('Expected a BufferedLogger instance.');
      }

      return reportTestFileResults(
        logger,
        testFile,
        args.browserNames,
        favoriteBrowser,
        args.config.rootDir,
        stackLocationRegExp,
        sessionsForTestFile,
        sourceMapFunction,
      );
    },

    getTestProgress({ testRun, focusedTestFile, testCoverage }) {
      if (!reportTestProgress) {
        return [];
      }

      return getTestProgressReport(args.config, {
        browsers: args.browsers,
        browserNames: args.browserNames,
        testRun,
        testFiles: args.testFiles,
        sessions: args.sessions,
        startTime: args.startTime,
        focusedTestFile,
        watch: args.config.watch,
        coverage: !!args.config.coverage,
        coverageConfig: args.config.coverageConfig,
        testCoverage,
      });
    },
  };
}
