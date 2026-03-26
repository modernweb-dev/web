import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);

/**
 * @deprecated `@web/mocks` is deprecated and only supports up to Storybook 8. Please migrate to `@web/storybook-addon-mocks` for Storybook 9 support.
 **/
export function mockPlugin() {
  return {
    name: 'wds-plugin-msw',
    /**
     * @param {import('koa').Context} context
     */
    serve(context) {
      if (context.request.url === '/__msw_sw__.js') {
        const serviceWorkerPath = require.resolve('msw/mockServiceWorker.js');
        return readFileSync(serviceWorkerPath, 'utf8');
      }
    },
  };
}
