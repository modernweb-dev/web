import { legacyPlugin } from '@web/dev-server-legacy';

export default {
  nodeResolve: true,
  rootDir: '../../..',
  middleware: [
    (ctx, next) => {
      ctx.headers['user-agent'] = '<removed user agent to trigger legacy>';
      return next();
    },
  ],
  plugins: [legacyPlugin()],
};
