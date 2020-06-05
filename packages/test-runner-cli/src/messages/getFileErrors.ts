import { TestResultError, TestSession } from '@web/test-runner-core';
import { TerminalEntry } from '../Terminal';
import { formatError } from './utils/formatError';
import { getFailedOnBrowsers } from './utils/getFailedOnBrowsers';

export function getFileErrors(
  testFile: string,
  allBrowserNames: string[],
  favoriteBrowser: string,
  failedSessions: TestSession[],
) {
  const entries: TerminalEntry[] = [];

  const sessionsThatFailedToImport = failedSessions.filter(s =>
    s.result!.failedImports.some(imp => imp.file === testFile),
  );

  if (sessionsThatFailedToImport.length > 0) {
    const session =
      sessionsThatFailedToImport.find(s => s.browserName === favoriteBrowser) ||
      sessionsThatFailedToImport[0];
    const failedImport = session.result!.failedImports.find(i => i.file === testFile)!;
    const failedBrowsers = sessionsThatFailedToImport.map(s => s.browserName);
    const failedOn = getFailedOnBrowsers(allBrowserNames, failedBrowsers);

    entries.push({ text: `❌ Failed to run test file${failedOn}`, indent: 1 });
    entries.push({ text: formatError(failedImport.error), indent: 6 });
    entries.push('');
  }
  const testErrorsPerBrowser = new Map<string, Map<string, TestResultError>>();

  for (const session of failedSessions) {
    for (const test of session.result!.tests) {
      if (test.error) {
        let testErrorsForBrowser = testErrorsPerBrowser.get(test.name);
        if (!testErrorsForBrowser) {
          testErrorsForBrowser = new Map<string, TestResultError>();
          testErrorsPerBrowser.set(test.name, testErrorsForBrowser);
        }
        testErrorsForBrowser.set(session.browserName, test.error!);
      }
    }
  }

  if (testErrorsPerBrowser.size > 0) {
    for (const [name, errorsForBrowser] of testErrorsPerBrowser) {
      const failedBrowsers = Array.from(errorsForBrowser.keys());
      const favoriteError =
        errorsForBrowser.get(favoriteBrowser) ?? errorsForBrowser.get(failedBrowsers[0])!;
      const failedOn = getFailedOnBrowsers(allBrowserNames, failedBrowsers);

      entries.push({ text: `❌ ${name}${failedOn}`, indent: 1 });
      entries.push({ text: formatError(favoriteError), indent: 6 });
      entries.push('');
    }
  }

  return entries;
}
