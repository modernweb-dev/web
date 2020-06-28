import { Middleware } from 'koa';

/**
 * Creates middleware which strips a base path from each request
 */
export function basePathMiddleware(basePath: string): Middleware {
  return (ctx, next) => {
    if (ctx.url.startsWith(basePath)) {
      ctx.url = ctx.url.replace(basePath, '');
    }

    return next();
  };
}
