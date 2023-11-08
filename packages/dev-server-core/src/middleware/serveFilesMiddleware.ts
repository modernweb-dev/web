import { Middleware } from 'koa';
import send from 'koa-send';
import koaStatic, { Options as KoaStaticOptions } from 'koa-static';
import { isOutsideRootDir, resolvePathOutsideRootDir } from '../utils.js';

/**
 * Creates multiple middleware used for serving files.
 */
export function serveFilesMiddleware(rootDir: string): Middleware[] {
  const koaStaticOptions: KoaStaticOptions = {
    hidden: true,
    defer: true,
    brotli: false,
    gzip: false,
    setHeaders(res) {
      res.setHeader('cache-control', 'no-cache');
    },
  };

  // the wds-root-dir parameter indicates using a different root directory as a path relative
  // from the regular root dir or as an absolute path
  const serveCustomRootDirMiddleware: Middleware = async (ctx, next) => {
    if (isOutsideRootDir(ctx.path)) {
      const { normalizedPath, newRootDir } = resolvePathOutsideRootDir(ctx.path, rootDir);
      await send(ctx, normalizedPath, { ...koaStaticOptions, root: newRootDir });
      return;
    }
    return next();
  };

  // serve static files from the regular root dir
  return [serveCustomRootDirMiddleware, koaStatic(rootDir, koaStaticOptions)];
}
