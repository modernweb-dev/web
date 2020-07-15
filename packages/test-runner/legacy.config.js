/* eslint-disable */
const { legacyPlugin } = require('@web/dev-server-legacy');

module.exports = {
  middleware: [
    (ctx, next) => {
      ctx.headers['user-agent'] = '<removed user agent>';
      return next();
    },
  ],
  plugins: [legacyPlugin()],
};
