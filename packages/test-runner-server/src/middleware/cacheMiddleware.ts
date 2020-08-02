import { Middleware } from '@web/dev-server-core';
import path from 'path';

export function cacheMiddleware(cachedPatterns: string[], watch: boolean): Middleware {
  return async (context, next) => {
    await next();

    if (
      path.extname(context.path) &&
      (!watch || cachedPatterns.some(pattern => context.path.includes(pattern)))
    ) {
      context.response.set('cache-control', 'public, max-age=31536000');
    }
  };
}
