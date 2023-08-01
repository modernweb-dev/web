import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export function mockPlugin() {
  return {
    name: 'wds-plugin-msw',
    /**
     * @param {import('koa').Context} context
     */
    serve(context) {
      if (context.request.url === '/__msw_sw__.js') {
        const serviceWorkerPath = path.resolve(__dirname, './sw.js');
        return readFileSync(serviceWorkerPath, 'utf8');
      }
    },
  };
}
