export function getFailedOnBrowsers(
  allBrowserNames: string[],
  failedBrowsers: string[],
  includeFailed = true,
) {
  if (allBrowserNames.length === 1 || failedBrowsers.length === allBrowserNames.length) {
    return '';
  }
  const browserString =
    failedBrowsers.length === 1
      ? failedBrowsers[0]
      : failedBrowsers.slice(0, -1).join(', ') + ' and ' + failedBrowsers.slice(-1);
  return ` (${includeFailed ? 'failed ' : ''}on ${browserString})`;
}
