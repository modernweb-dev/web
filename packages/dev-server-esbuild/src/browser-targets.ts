import { browsers } from '@mdn/browser-compat-data';

type Release = { status: string };
export type Browser = { name: string; version: string };

export const TARGET_LATEST_MODERN = createModernTarget();
// earliest browser versions to support module scripts, dynamic imports and import.meta
export const TARGET_LOWEST_ESM_SUPPORT = ['chrome64', 'edge79', 'firefox67', 'safari11.1'];

function createModernTarget() {
  try {
    const latestChrome = getLatestStableMajor(browsers.chrome.releases);
    if (!latestChrome) throw new Error('Could not find latest Chrome major version');

    const latestEdge = getLatestStableMajor(browsers.edge.releases);
    if (!latestEdge) throw new Error('Could not find latest Chrome major version');

    const latestSafari = getLatestStableMajor(browsers.safari.releases);
    if (!latestSafari) throw new Error('Could not find latest Safari major version');

    const latestFirefox = getLatestStableMajor(browsers.firefox.releases);
    if (!latestFirefox) throw new Error('Could not find latest Chrome major version');

    return [
      `chrome${latestChrome - 1}`,
      `edge${latestEdge - 1}`,
      `safari${latestSafari}`,
      `firefox${latestFirefox}`,
    ];
  } catch (error) {
    throw new Error(
      `Error while initializing default browser targets for @web/dev-server-esbuild: ${error.message}`,
    );
  }
}

function getMajorVersion(version: string | number) {
  return Number(version.toString().split('.')[0]);
}

export function getLatestStableMajor(releases: Record<string, Release>): number | undefined {
  const release = Object.entries(releases).find(([, release]) => release.status === 'current')?.[0];
  if (release) {
    return getMajorVersion(release);
  }
  return undefined;
}

function isWithinRange(releases: Record<string, Release>, version: string | number, range: number) {
  const currentMajorVersion = getMajorVersion(version);
  const latestMajorVersion = getLatestStableMajor(releases);
  if (latestMajorVersion == null) {
    return false;
  }
  return currentMajorVersion >= latestMajorVersion - range;
}

export function isLatestSafari({ name, version }: Browser) {
  const nameLowerCase = name.toLowerCase();

  // don't use include to avoid matching safari iOS
  if (nameLowerCase === 'safari') {
    return isWithinRange(browsers.safari.releases, version, 0);
  }

  return false;
}

export function isLatestModernBrowser({ name, version }: Browser) {
  const nameLowerCase = name.toLowerCase();

  if (['chrome', 'chromium'].some(name => nameLowerCase.includes(name))) {
    return isWithinRange(browsers.chrome.releases, version, 1);
  }

  if (nameLowerCase.includes('edge')) {
    return isWithinRange(browsers.edge.releases, version, 1);
  }

  if (nameLowerCase.includes('firefox')) {
    return isWithinRange(browsers.firefox.releases, version, 0);
  }

  return false;
}
