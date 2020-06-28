import { Middleware } from 'koa';
import { Plugin } from '../Plugin';

/**
 * Sets up a middleware which allows plugins to resolve the mime type.
 */
export function pluginMimeTypeMiddleware(plugins: Plugin[]): Middleware {
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
        context.type = type;
      }
    }
  };
}
