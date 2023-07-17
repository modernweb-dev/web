import { Middleware } from 'koa';
import { Plugin } from '../plugins/Plugin.js';

/**
 * Calls fileParsed hook on plugins.
 */
export function pluginFileParsedMiddleware(plugins: Plugin[]): Middleware {
  const fileParsedPlugins = plugins.filter(p => 'fileParsed' in p);
  if (fileParsedPlugins.length === 0) {
    // nothing to call
    return (ctx, next) => next();
  }

  return async (context, next) => {
    await next();

    if (context.status < 200 || context.status >= 300) {
      return undefined;
    }

    for (const plugin of fileParsedPlugins) {
      plugin.fileParsed?.(context);
    }
  };
}
