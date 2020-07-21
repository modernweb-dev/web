import { TestSession } from '@web/test-runner-core';
import chalk from 'chalk';
import { TerminalEntry } from '../Terminal';

export function getBrowserLogs(sessions: TestSession[]) {
  const entries: TerminalEntry[] = [];
  const commonLogs: string[] = [];
  const logsByBrowser = new Map<string, string[]>();

  const allLogs = sessions.map(s => s.logs);
  for (const session of sessions) {
    for (const log of session.logs) {
      // for the first session, we always include all logs
      // for others we deduplicate logs, this way we can allow the same log
      // msg appearing multiple times while also deduplicating common logs
      // between browsers
      if (session === sessions[0] || !commonLogs.includes(log)) {
        if (allLogs.every(logs => logs.includes(log))) {
          commonLogs.push(log);
        } else {
          let logsForBrowser = logsByBrowser.get(session.browserName);
          if (!logsForBrowser) {
            logsForBrowser = [];
            logsByBrowser.set(session.browserName, logsForBrowser);
          }
          logsForBrowser.push(log);
        }
      }
    }
  }

  if (commonLogs.length > 0) {
    entries.push({ text: `🚧 Browser logs:`, indent: 1 });
    for (const log of commonLogs) {
      entries.push({ text: `${chalk.bold(chalk.gray('>'))} ${log}`, indent: 4 });
    }
  }

  for (const [browser, logs] of logsByBrowser) {
    entries.push({ text: `🚧 Browser logs on ${browser}:`, indent: 1 });
    for (const log of logs) {
      entries.push({ text: `${chalk.bold(chalk.gray('>'))} ${log}`, indent: 4 });
    }
  }

  if (entries.length > 0) {
    entries.push('');
  }

  return entries;
}
