import { legacyPlugin } from '@web/dev-server-legacy';

export default {
  middleware: [
    (ctx, next) => {
      ctx.headers['user-agent'] = '<removed user agent>';
      return next();
    },
  ],
  plugins: [legacyPlugin()],
};
