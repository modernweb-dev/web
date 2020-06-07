import { TestSession } from '@web/test-runner-core';
import chalk from 'chalk';
import { TerminalEntry } from '../Terminal';

export function getRequest404s(sessions: TestSession[]) {
  const entries: TerminalEntry[] = [];
  const common404s: string[] = [];
  const request404sPerBrowser = new Map<string, string[]>();

  const all404s = sessions.map(s => s.request404s);
  for (const session of sessions) {
    for (const request404 of session.request404s) {
      // for the first session, we always include all request 404s
      // for others we deduplicate 404s, this way we can allow the same 404
      // msg appearing multiple times while also deduplicating common 404s
      // between browsers
      if (session === sessions[0] || !common404s.includes(request404)) {
        if (all404s.every(r404s => r404s.includes(request404))) {
          common404s.push(request404);
        } else {
          let request404sForBrowser = request404sPerBrowser.get(session.browserName);
          if (!request404sForBrowser) {
            request404sForBrowser = [];
            request404sPerBrowser.set(session.browserName, request404sForBrowser);
          }
          request404sForBrowser.push(request404);
        }
      }
    }
  }

  if (common404s.length > 0) {
    entries.push({ text: '🚧 404 network requests:', indent: 1 });
    for (const request404 of common404s) {
      entries.push({ text: `${chalk.bold(chalk.gray('-'))} ${request404}`, indent: 4 });
    }
  }

  for (const [browser, request404s] of request404sPerBrowser) {
    entries.push({ text: `🚧 404 network requests on ${browser}:`, indent: 2 });
    for (const request404 of request404s) {
      entries.push({ text: `${chalk.bold(chalk.gray('-'))} ${request404}`, indent: 4 });
    }
  }

  if (entries.length > 0) {
    entries.push('');
  }

  return entries;
}
