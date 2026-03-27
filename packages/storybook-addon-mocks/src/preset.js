// @ts-nocheck

import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

/**
 * @param {import('@web/dev-server').DevServerConfig} config
 */
export async function wdsFinal(config) {
  const { mockPlugin } = await import('@web/mocks/plugins.js');
  // @ts-expect-error
  config.plugins.push(mockPlugin());
  return config;
}

/**
 * @param {import('rollup').RollupOptions} config
 */
export async function rollupFinal(config) {
  const require = createRequire(import.meta.url);
  // @ts-expect-error
  config.plugins.push({
    name: 'rollup-plugin-msw',
    writeBundle(opts) {
      const serviceWorkerPath = require.resolve('msw/mockServiceWorker.js');
      const sw = fs.readFileSync(serviceWorkerPath, 'utf8');
      const outPath = path.join(opts.dir, '__msw_sw__.js');
      fs.writeFileSync(outPath, sw);
    },
  });
  return config;
}
