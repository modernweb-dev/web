import { Middleware } from 'koa';
import { FSWatcher } from 'chokidar';
import fs from 'fs';

import { getRequestFilePath } from '../utils';

/**
 * Sets up a middleware which tracks served files and sends a reload message to any
 * active browsers when any of the files change.
 */
export function watchServedFilesMiddleware(fileWatcher: FSWatcher, rootDir: string): Middleware {
  return async (ctx, next) => {
    await next();

    if (ctx.response.status !== 404) {
      let filePath = getRequestFilePath(ctx.url, rootDir);
      // if the request ends with a / it might be an index.html, check if it exists
      // and watch it
      if (filePath.endsWith('/')) {
        filePath += 'index.html';
      }

      // watch file if it exists
      fs.stat(filePath, (err, stats) => {
        if (!err && !stats.isDirectory()) {
          fileWatcher.add(filePath);
        }
      });
    }
  };
}
