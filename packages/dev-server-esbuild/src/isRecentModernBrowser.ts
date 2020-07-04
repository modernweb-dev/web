import { browsers } from 'mdn-browser-compat-data';
import { UAParser } from 'ua-parser-js';

interface Release {
  status: string;
}

export function getLatestStableRelease(releases: Record<string, Release>): string | undefined {
  return Object.entries(releases).find(([, release]) => release.status === 'current')?.[0];
}

function getMajorVersion(version: string | number) {
  return Number(version.toString().split('.')[0]);
}

function isWithinRange(releases: Record<string, Release>, version: string | number, range: number) {
  const currentMajorVersion = getMajorVersion(version);
  const latestRelease = getLatestStableRelease(releases);
  if (!latestRelease) {
    return false;
  }
  const latestMajorVersion = getMajorVersion(latestRelease);
  return currentMajorVersion >= latestMajorVersion - range;
}

export function isRecentModernBrowserForBrowser(browser: string, version: string | number) {
  const browserLowerCase = browser.toLowerCase();

  if (['chrome headless', 'chrome', 'chromium'].includes(browserLowerCase)) {
    return isWithinRange(browsers.chrome.releases, version, 1);
  }

  if (browserLowerCase === 'firefox') {
    return isWithinRange(browsers.firefox.releases, version, 0);
  }

  if (browserLowerCase === 'edge') {
    return isWithinRange(browsers.edge.releases, version, 1);
  }

  return false;
}

export function isRecentModernBrowser(userAgent: string) {
  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser();

  if (!browser || !browser.name || !browser.major) {
    return false;
  }

  return isRecentModernBrowserForBrowser(browser.name, browser.major);
}
