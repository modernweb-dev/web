import { parseUserAgent } from './parseUserAgent.js';
import {
  TARGET_LATEST_MODERN,
  TARGET_LOWEST_ESM_SUPPORT,
  Browser,
  isLatestModernBrowser,
  isLatestSafari,
} from './browser-targets.js';

const cache = new Map<string, undefined | string | string[]>();

function getTargetForUserAgent(target: string, userAgent: string): string | string[] {
  const browser = parseUserAgent(userAgent);
  if (typeof browser.name === 'string' && typeof browser.version === 'string') {
    if (target === 'auto') {
      if (isLatestModernBrowser(browser as Browser)) {
        // skip compiling on latest chrome/firefox/edge
        return 'esnext';
      }

      if (isLatestSafari(browser as Browser)) {
        // we don't skip safari, but we also don't want to compile to the lowest common denominator
        return `safari${browser.version}`;
      }
    }

    if (target === 'auto-always') {
      if (isLatestModernBrowser(browser as Browser) || isLatestSafari(browser as Browser)) {
        // compile to JS compatible with latest chrome/firefox/edge/safari
        return TARGET_LATEST_MODERN;
      }
    }
  }

  // fall back to compiling to the lowest compatible with browsers that support es modules
  return TARGET_LOWEST_ESM_SUPPORT;
}

export function getEsbuildTarget(
  targets: string | string[],
  userAgent?: string,
): string | string[] {
  const target =
    typeof targets === 'string' ? targets : targets.length === 1 ? targets[0] : undefined;

  if (!target || !['auto-always', 'auto'].includes(target)) {
    // user has defined one or more targets that is not auto, so compile to this target directly
    return targets;
  }

  if (userAgent == null) {
    // user has auto but there is no user agent, fall back to the lowest compatible with browsers that support es modules
    return TARGET_LOWEST_ESM_SUPPORT;
  }

  const cached = cache.get(userAgent);
  if (cached != null) {
    return cached;
  }

  const targetForUserAgent = getTargetForUserAgent(target, userAgent);
  cache.set(userAgent, targetForUserAgent);
  return targetForUserAgent;
}
