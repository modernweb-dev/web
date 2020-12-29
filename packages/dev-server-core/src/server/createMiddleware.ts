import { Middleware } from 'koa';
import koaEtag from 'koa-etag';
import { FSWatcher } from 'chokidar';

import { DevServerCoreConfig } from './DevServerCoreConfig';
import { basePathMiddleware } from '../middleware/basePathMiddleware';
import { etagCacheMiddleware } from '../middleware/etagCacheMiddleware';
import { historyApiFallbackMiddleware } from '../middleware/historyApiFallbackMiddleware';
import { pluginMimeTypeMiddleware } from '../middleware/pluginMimeTypeMiddleware';
import { pluginServeMiddleware } from '../middleware/pluginServeMiddleware';
import { pluginTransformMiddleware } from '../middleware/pluginTransformMiddleware';
import { Logger } from '../logger/Logger';
import { watchServedFilesMiddleware } from '../middleware/watchServedFilesMiddleware';
import { pluginFileParsedMiddleware } from '../middleware/pluginFileParsedMiddleware';
import { serveFilesMiddleware } from '../middleware/serveFilesMiddleware';

/**
 * Creates middlewares based on the given configuration. The middlewares can be
 * used by a koa server using `app.use()`:
 */
export function createMiddleware(
  config: DevServerCoreConfig,
  logger: Logger,
  fileWatcher: FSWatcher,
) {
  const middlewares: Middleware[] = [];

  middlewares.push(async (ctx, next) => {
    logger.debug(`Receiving request: ${ctx.url}`);
    await next();
    logger.debug(`Responding to request: ${ctx.url} with status ${ctx.status}`);
  });

  // strips a base path from requests
  if (config.basePath) {
    middlewares.push(basePathMiddleware(config.basePath));
  }

  // adds custom user's middlewares
  for (const m of config.middleware ?? []) {
    middlewares.push(m);
  }

  // watch files that are served
  middlewares.push(watchServedFilesMiddleware(fileWatcher, config.rootDir));

  // serves 304 responses if resource hasn't changed
  middlewares.push(etagCacheMiddleware());

  // adds etag headers for caching
  middlewares.push(koaEtag());

  // serves index.html for non-file requests for SPA routing
  if (config.appIndex) {
    middlewares.push(historyApiFallbackMiddleware(config.appIndex, config.rootDir, logger));
  }

  const plugins = config.plugins ?? [];
  middlewares.push(pluginFileParsedMiddleware(plugins));
  middlewares.push(pluginTransformMiddleware(logger, config, fileWatcher));
  middlewares.push(pluginMimeTypeMiddleware(logger, plugins));
  middlewares.push(pluginServeMiddleware(logger, plugins));
  middlewares.push(...serveFilesMiddleware(config.rootDir));

  return middlewares;
}
