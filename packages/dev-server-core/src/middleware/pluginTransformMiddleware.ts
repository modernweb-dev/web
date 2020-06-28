import { FSWatcher } from 'chokidar';
import { Middleware } from 'koa';
import { Config } from '../Config';
import { PluginTransformCache } from './PluginTransformCache';
import { getResponseBody, RequestCancelledError } from '../utils';
import { PluginSyntaxError } from '../logger/PluginSyntaxError';
import { Logger } from '../logger/Logger';

/**
 * Sets up a middleware which allows plugins to transform files before they are served to the browser.
 */
export function pluginTransformMiddleware(
  config: Config,
  logger: Logger,
  fileWatcher: FSWatcher,
): Middleware {
  const cache = new PluginTransformCache(fileWatcher, config.rootDir);
  const transformPlugins = config.plugins.filter(p => 'transform' in p);
  if (transformPlugins.length === 0) {
    // nothing to transform
    return (ctx, next) => next();
  }

  return async (context, next) => {
    const result = await cache.get(context);
    if (result) {
      context.body = result.body;
      for (const [k, v] of Object.entries(result.headers)) {
        context.response.set(k, v);
      }
      logger.debug(`Serving ${context.url} from plugin transform cache`);
      return;
    }

    await next();

    if (context.status < 200 || context.status >= 300) {
      return;
    }

    try {
      // ensure response body is turned into a string or buffer
      await getResponseBody(context);

      let transformCache = true;
      for (const plugin of transformPlugins) {
        const result = await plugin.transform?.(context);
        if (typeof result === 'object') {
          transformCache = result.transformCache === false ? false : transformCache;
          if (result.body != null) {
            context.body = result.body;
          }

          if (result.headers) {
            for (const [k, v] of Object.entries(result.headers)) {
              context.response.set(k, v);
            }
          }
        } else if (typeof result === 'string') {
          context.body = result;
        }
      }

      if (transformCache) {
        logger.debug(`Added ${context.url} to plugin transform cache`);
        cache.set(context);
      }
    } catch (error) {
      if (error instanceof RequestCancelledError) {
        return undefined;
      }
      if (error instanceof PluginSyntaxError) {
        logger.logSyntaxError(error);
      }
      throw error;
    }
  };
}
