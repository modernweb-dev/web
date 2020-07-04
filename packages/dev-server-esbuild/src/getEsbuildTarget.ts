import { isRecentModernBrowser } from './isRecentModernBrowser';
import { PluginTarget } from './esbuildPlugin';

export function getEsbuildTarget(target: PluginTarget, userAgent?: string) {
  if (target !== 'auto') {
    return target;
  }

  if (userAgent && isRecentModernBrowser(userAgent)) {
    return 'esnext';
  }

  // when auto is set and this isn't a recent modern browser, we compile to es2017
  return 'es2017';
}
