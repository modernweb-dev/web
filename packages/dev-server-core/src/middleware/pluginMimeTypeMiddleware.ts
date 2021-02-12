import { Middleware } from 'koa';
import { Logger } from '../logger/Logger';
import { Plugin } from '../plugins/Plugin';

/**
 * Sets up a middleware which allows plugins to resolve the mime type.
 */
export function pluginMimeTypeMiddleware(logger: Logger, plugins: Plugin[]): Middleware {
  const mimeTypePlugins = plugins.filter(p => 'resolveMimeType' in p);
  if (mimeTypePlugins.length === 0) {
    // nothing to transform
    return (ctx, next) => next();
  }

  return async (context, next) => {
    await next();

    if (context.status < 200 || context.status >= 300) {
      return undefined;
    }

    for (const plugin of mimeTypePlugins) {
      const result = await plugin.resolveMimeType?.(context);
      const type = typeof result === 'object' ? result.type : result;
      if (type) {
        logger.debug(`Plugin ${plugin.name} resolved mime type of ${context.path} to ${type}`);
        context.type = type;
      }
    }
  };
}
