import { Middleware } from 'koa';
import path from 'path';
import { toBrowserPath } from '../utils.js';
import { Logger } from '../logger/Logger.js';

/**
 * Serves index.html when a non-file request within the scope of the app index is made.
 * This allows SPA routing.
 */
export function historyApiFallbackMiddleware(
  appIndex: string,
  rootDir: string,
  logger: Logger,
): Middleware {
  const resolvedAppIndex = path.resolve(appIndex);
  const relativeAppIndex = path.relative(rootDir, resolvedAppIndex);
  const appIndexBrowserPath = `/${toBrowserPath(relativeAppIndex)}`;
  const appIndexBrowserPathPrefix = path.dirname(appIndexBrowserPath);

  return (ctx, next) => {
    if (ctx.method !== 'GET' || path.extname(ctx.path)) {
      // not a GET, or a direct file request
      return next();
    }

    if (!ctx.headers || typeof ctx.headers.accept !== 'string') {
      return next();
    }

    if (ctx.headers.accept.includes('application/json')) {
      return next();
    }

    if (!(ctx.headers.accept.includes('text/html') || ctx.headers.accept.includes('*/*'))) {
      return next();
    }

    if (!ctx.url.startsWith(appIndexBrowserPathPrefix)) {
      return next();
    }

    // rewrite url and let static serve take it further
    logger.debug(`Rewriting ${ctx.url} to app index ${appIndexBrowserPath}`);
    ctx.url = appIndexBrowserPath;
    return next();
  };
}
