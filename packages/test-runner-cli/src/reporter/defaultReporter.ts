import { Reporter, ReporterArgs } from '@web/test-runner-core';

import { createSourceMapFunction, SourceMapFunction } from '../utils/createSourceMapFunction';
import { getTestFileReport } from './getTestFileReport';
import { getTestProgressReport } from './getTestProgress';

export interface DefaultReporterArgs {
  reportTestResults?: boolean;
  reportTestProgress?: boolean;
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
        args.browserNames.find(browserName => {
          const n = browserName.toLowerCase();
          return n.includes('chrome') || n.includes('chromium') || n.includes('firefox');
        }) ?? args.browserNames[0];
      stackLocationRegExp = new RegExp(
        `(\\(|@)(?:${args.config.protocol}:\\/\\/${args.config.hostname}:${args.config.port})*(.*\\.\\w{2,3}.*?)(?::(\\d+))?(?::(\\d+))?(\\)|$)`,
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

    async reportTestFileResult({ sessionsForTestFile, testFile }) {
      if (!reportTestResults) {
        return undefined;
      }

      return getTestFileReport(
        testFile,
        args.browserNames,
        favoriteBrowser,
        args.config.rootDir,
        stackLocationRegExp,
        sessionsForTestFile,
        sourceMapFunction,
      );
    },

    reportTestProgress({ testRun, focusedTestFile, testCoverage }) {
      if (!reportTestProgress) {
        return undefined;
      }

      return getTestProgressReport(args.config, {
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
