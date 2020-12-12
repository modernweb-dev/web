import { Middleware } from 'koa';
import path from 'path';
import send from 'koa-send';
import koaStatic, { Options as KoaStaticOptions } from 'koa-static';

const OUTSIDE_ROOT_KEY = '/__wds-outside-root__/';

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
    if (ctx.path.startsWith(OUTSIDE_ROOT_KEY)) {
      const [, , depthString] = ctx.path.split('/');
      const depth = Number(depthString);
      if (depth == null || Number.isNaN(depth)) {
        throw new Error(`Invalid wds-root-dir path: ${ctx.path}`);
      }

      ctx.path = ctx.path.replace(`${OUTSIDE_ROOT_KEY}${depth}`, '');
      const localRootDir = path.resolve(rootDir, `..${path.sep}`.repeat(depth));
      await send(ctx, ctx.path, { ...koaStaticOptions, root: localRootDir });
      return;
    }
    return next();
  };

  // serve static files from the regular root dir
  return [serveCustomRootDirMiddleware, koaStatic(rootDir, koaStaticOptions)];
}
