import { Logger, Reporter, ReporterArgs, BufferedLogger } from '@web/test-runner-core';

import { reportTestFileResults } from './reportTestFileResults';
import { getTestProgressReport } from './getTestProgress';

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

  return {
    start(_args) {
      args = _args;
      favoriteBrowser =
        args.browserNames.find(name => {
          const n = name.toLowerCase();
          return n.includes('chrome') || n.includes('chromium') || n.includes('firefox');
        }) ?? args.browserNames[0];
    },

    reportTestFileResults({ logger, sessionsForTestFile, testFile }) {
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
        sessionsForTestFile,
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
