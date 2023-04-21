import { TestSession, Logger } from '@web/test-runner-core';

export function reportBrowserLogs(logger: Logger, sessions: TestSession[]) {
  const commonLogs: any[] = [];
  const commonStringified: string[] = [];
  const logsByBrowser = new Map<string, any[]>();

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
          commonLogs.push(args);
          commonStringified.push(stringifiedArgs);
        } else {
          let logsForBrowser = logsByBrowser.get(session.browser.name);
          if (!logsForBrowser) {
            logsForBrowser = [];
            logsByBrowser.set(session.browser.name, logsForBrowser);
          }
          logsForBrowser.push(args);
        }
      }
    }
  }

  if (commonLogs.length > 0) {
    logger.log(` 🚧 Browser logs:`);
    logger.group();
    logger.group();
    logger.group();
    for (const args of commonLogs) {
      logger.log(...args);
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
    for (const args of logs) {
      logger.log(...args);
    }
    logger.groupEnd();
    logger.groupEnd();
    logger.groupEnd();
  }

  if (commonLogs.length > 0 || logsByBrowser.size > 0) {
    logger.log('');
  }
}
