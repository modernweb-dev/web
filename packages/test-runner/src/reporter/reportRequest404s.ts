import { TestSession, Logger } from '@web/test-runner-core';
import { bold, gray } from 'nanocolors';

export function reportRequest404s(logger: Logger, sessions: TestSession[]) {
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
          let request404sForBrowser = request404sPerBrowser.get(session.browser.name);
          if (!request404sForBrowser) {
            request404sForBrowser = [];
            request404sPerBrowser.set(session.browser.name, request404sForBrowser);
          }
          request404sForBrowser.push(request404);
        }
      }
    }
  }

  if (common404s.length > 0) {
    logger.log(' 🚧 404 network requests:');
    logger.group();
    logger.group();
    for (const request404 of common404s) {
      logger.log(`${bold(gray('-'))} ${request404}`);
    }
    logger.groupEnd();
    logger.groupEnd();
  }

  for (const [browser, request404s] of request404sPerBrowser) {
    logger.log(` 🚧 404 network requests on ${browser}:`);
    logger.group();
    logger.group();
    for (const request404 of request404s) {
      logger.log(`${bold(gray('-'))} ${request404}`);
    }
    logger.groupEnd();
    logger.groupEnd();
  }

  if (common404s.length > 0 || request404sPerBrowser.size > 0) {
    logger.log('');
  }
}
