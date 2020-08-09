/* eslint-disable no-console */
import { resolveUserAgent, ResolvedUserAgent } from 'browserslist-useragent';
import browserslist from 'browserslist';
import * as caniuse from 'caniuse-api';
import { Logger, Context } from '@web/dev-server-core';

/**
 * We compile to es modules when the browser supports module scripts, dynamic imports
 * and import.meta.url. Unfortunately, caniuse doesn't report import.meta.url. Chrome 63
 * is the only browser which suppors dynamic imports but not import.meta.url.
 */
const moduleFeatures = ['es6-module', 'es6-module-dynamic-import'];

const cache = new Map<string, boolean>();
const browserAliases: Record<string, string> = {
  'UC Browser': 'UCAndroid',
};

/**
 * The user agent parser does not always return a valid version for samsung,
 * so we need to normalize it.
 */
function normalizeSamsungVersion(browser: string, version: string[]) {
  try {
    browserslist(`${browser} ${version}`);
    // browserslist didn't throw, return the valid version
    return version;
  } catch (error) {
    // we gave an invalid version to browserslist, so we try to
    // find the nearest matching major version for samsung browser
    const validVersions = [
      ...Object.keys((browserslist as any).versionAliases.samsung),
      ...(browserslist as any).data.samsung.versions,
    ];

    return validVersions.find(validVersion => validVersion[0] === version[0]);
  }
}

/**
 * The user agent parser returns patch versions, which browserslist doesn't
 * know about. Mostly the major version is sufficient, except for safari.
 */
function getBrowserVersion(resolvedUA: ResolvedUserAgent) {
  const version = resolvedUA.version.split('.');
  switch (resolvedUA.family) {
    case 'Safari':
    case 'iOS':
      return `${version[0]}.${version[1]}`;
    case 'Samsung':
      return normalizeSamsungVersion(resolvedUA.family, version);
    default:
      return version[0];
  }
}

function getBrowserName(browserName: string) {
  return browserAliases[browserName] || browserName;
}

/**
 * Returns whether this browser supports es modules. We count this when the browser
 * supports module syntax, scripts, dynamic imports. We can't feature detect
 * import.meta.url but any browsers which supports dynamic import supports import.meta.url,
 * except for chrome 63.
 */
function getSupportsEsm(browserTarget: string) {
  if (browserTarget.toLowerCase() === 'chrome 63') {
    return false;
  }
  return moduleFeatures.every(ft => caniuse.isSupported(ft, browserTarget));
}

/**
 * Calculates the user agent's compatibility.
 */
function calculateIsLegacyBrowser(userAgent: string, logger: Logger) {
  try {
    const resolvedUA = resolveUserAgent(userAgent);
    const browserTarget = `${getBrowserName(resolvedUA.family)} ${getBrowserVersion(resolvedUA)}`;
    return !getSupportsEsm(browserTarget);
  } catch (error) {
    logger.warn(
      `[@web/dev-server-legacy]: Unknown user agent ${userAgent}, treating it as a legacy browser.`,
    );
    return true;
  }
}

export function isLegacyBrowser(ctx: Context, logger: Logger) {
  const userAgent = ctx.get('user-agent');
  let isLegacyBrowser = cache.get(userAgent);
  if (isLegacyBrowser == null) {
    isLegacyBrowser = calculateIsLegacyBrowser(userAgent, logger);
    cache.set(userAgent, isLegacyBrowser);
  }
  return isLegacyBrowser;
}
