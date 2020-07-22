import { Middleware } from 'koa';
import { FSWatcher } from 'chokidar';
import path from 'path';

import { getRequestFilePath } from '../utils';

/**
 * Sets up a middleware which tracks served files and sends a reload message to any
 * active browsers when any of the files change.
 */
export function watchServedFilesMiddleware(fileWatcher: FSWatcher, rootDir: string): Middleware {
  return async (ctx, next) => {
    await next();

    if (ctx.response.status !== 404 && path.extname(ctx.path)) {
      const filePath = getRequestFilePath(ctx, rootDir);
      fileWatcher.add(filePath);
    }
  };
}
