export default {
  middleware: [
    function rewriteIndex(ctx, next) {
      if (ctx.url === '/' || ctx.url === '/index.html') {
        ctx.url = '/demo/index-rewrite/index.html';
      }

      return next();
    },
  ],
};
