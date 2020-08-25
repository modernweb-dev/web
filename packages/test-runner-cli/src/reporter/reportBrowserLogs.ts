import { TestSession, Logger } from '@web/test-runner-core';
import { MARKER_BROWSER_ERROR, BrowserError } from '@web/browser-logs';
import { formatStackTrace } from '../utils/formatStackTrace';
import { SourceMapFunction } from '../utils/createSourceMapFunction';

/**
 * Transforms logs, resolving stack traces in errors.
 */
function transformLogArgs(
  logArgs: any[],
  userAgent: string | undefined,
  rootDir: string,
  stackLocationRegExp: RegExp,
  sourceMapFunction: SourceMapFunction,
) {
  return logArgs.map(log => {
    if (log == null) {
      return log;
    }

    if (log[MARKER_BROWSER_ERROR]) {
      const error = log as BrowserError;
      if (!error.stack) {
        return error.message;
      }

      return formatStackTrace(
        log as BrowserError,
        userAgent,
        rootDir,
        stackLocationRegExp,
        sourceMapFunction,
      );
    }
    return log;
  });
}

interface Log {
  userAgent?: string;
  args: any[];
}

export async function reportBrowserLogs(
  logger: Logger,
  sessions: TestSession[],
  rootDir: string,
  stackLocationRegExp: RegExp,
  sourceMapFunction: SourceMapFunction,
) {
  const commonLogs: Log[] = [];
  const commonStringified: string[] = [];
  const logsByBrowser = new Map<string, Log[]>();

  const allStringified = sessions.map(s => JSON.stringify(s.logs));
  for (const session of sessions) {
    for (const args of session.logs) {
      // for the first session, we always include all logs
      // for others we deduplicate logs, this way we can allow the same log
      // msg appearing multiple times while also deduplicating common logs
      // between browsers
      const stringifiedArgs = JSON.stringify(args);
      if (
        args.length > 0 &&
        (session === sessions[0] || !commonStringified.includes(stringifiedArgs))
      ) {
        if (allStringified.every(logs => logs.includes(stringifiedArgs))) {
          commonLogs.push({ userAgent: session.userAgent, args });
          commonStringified.push(stringifiedArgs);
        } else {
          let logsForBrowser = logsByBrowser.get(session.browser.name);
          if (!logsForBrowser) {
            logsForBrowser = [];
            logsByBrowser.set(session.browser.name, logsForBrowser);
          }
          logsForBrowser.push({ userAgent: session.userAgent, args });
        }
      }
    }
  }

  if (commonLogs.length > 0) {
    logger.log(` 🚧 Browser logs:`);
    logger.group();
    logger.group();
    logger.group();
    for (const { userAgent, args } of commonLogs) {
      const transformedArgs = await Promise.all(
        transformLogArgs(args, userAgent, rootDir, stackLocationRegExp, sourceMapFunction),
      );
      logger.log(...transformedArgs);
    }
    logger.groupEnd();
    logger.groupEnd();
    logger.groupEnd();
  }

  for (const [browser, logs] of logsByBrowser) {
    logger.log(` 🚧 Browser logs on ${browser}:`);
    logger.group();
    logger.group();
    logger.group();
    for (const { userAgent, args } of logs) {
      const transformedArgs = await Promise.all(
        transformLogArgs(args, userAgent, rootDir, stackLocationRegExp, sourceMapFunction),
      );
      logger.log(...transformedArgs);
    }
    logger.groupEnd();
    logger.groupEnd();
    logger.groupEnd();
  }

  if (commonLogs.length > 0 || logsByBrowser.size > 0) {
    logger.log('');
  }
}
