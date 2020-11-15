import { Middleware } from 'koa';
import path from 'path';
import { Logger } from '../logger/Logger';
import { Plugin } from '../Plugin';

/**
 * Sets up a middleware which allows plugins to serve files instead of looking it up in the file system.
 */
export function pluginServeMiddleware(logger: Logger, plugins: Plugin[]): Middleware {
  const servePlugins = plugins.filter(p => 'serve' in p);
  if (servePlugins.length === 0) {
    // nothing to serve
    return (ctx, next) => next();
  }

  return async (context, next) => {
    for (const plugin of servePlugins) {
      const response = await plugin.serve?.(context);

      if (typeof response === 'object') {
        if (response.body == null) {
          throw new Error(
            'A serve result must contain a body. Use the transform hook to change only the mime type.',
          );
        }

        context.body = response.body;
        if (response.type != null) {
          context.type = response.type;
        } else {
          context.type = path.extname(path.basename(context.path));
        }

        if (response.headers) {
          for (const [k, v] of Object.entries(response.headers)) {
            context.response.set(k, v);
          }
        }

        logger.debug(`Plugin ${plugin.name} served ${context.path}.`);
        context.status = 200;
        return;
      } else if (typeof response === 'string') {
        context.body = response;
        context.type = path.extname(path.basename(context.path));
        logger.debug(`Plugin ${plugin.name} served ${context.path}.`);
        context.status = 200;
        return;
      }
    }
    return next();
  };
}
