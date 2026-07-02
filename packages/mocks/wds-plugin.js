import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

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
