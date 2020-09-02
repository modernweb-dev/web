import { fileURLToPath } from 'url';
import { resolve } from 'path';

export default {
  rootDir: resolve(fileURLToPath(import.meta.url), '..', '..', '..'),
  middleware: [
    function rewriteIndex(ctx, next) {
      if (ctx.url === '/' || ctx.url === '/index.html') {
        ctx.url = '/demo/index-rewrite/index.html';
      }

      return next();
    },
  ],
};
