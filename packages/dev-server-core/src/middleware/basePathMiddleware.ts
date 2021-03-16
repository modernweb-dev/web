import { Middleware } from 'koa';

/**
 * Creates middleware which strips a base path from each request
 */
export function basePathMiddleware(basePath: string): Middleware {
  const pathToStrip = basePath.endsWith('/')
    ? basePath.substring(0, basePath.length - 1)
    : basePath;

  return (ctx, next) => {
    if (ctx.url.startsWith(pathToStrip)) {
      ctx.url = ctx.url.replace(pathToStrip, '');
    }

    return next();
  };
}
