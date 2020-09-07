import { TestResultError } from '../test-session/TestSession';

const navigationError = (reason: string) =>
  `Tests were interrupted because the page was ${reason}. This can happen when clicking a link, submitting a form or interacting with window.location.`;

/**
 * Returns an error if the browser was navigated by the user
 * @param testURL
 * @param navigations
 */
export function getBrowserPageNavigationError(
  testURL: URL,
  navigations: URL[],
): TestResultError | undefined {
  if (testURL && navigations.length > 1) {
    const nav = navigations[navigations.length - 1];
    if (nav.origin === testURL.origin && nav.pathname === testURL.pathname) {
      return { message: navigationError('reloaded') };
    } else {
      const reportedPath =
        testURL!.origin === nav.origin ? `${nav.pathname}${nav.search}` : nav.href;
      return {
        message: navigationError(`navigated to ${reportedPath}`),
      };
    }
  }
  return undefined;
}
