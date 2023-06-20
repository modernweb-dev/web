import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export function mswRollupPlugin() {
  return {
    name: 'rollup-plugin-msw',
    writeBundle(opts) {
      const serviceWorkerPath = path.resolve(__dirname, './sw.js');
      const sw = fs.readFileSync(serviceWorkerPath, 'utf8');
      const outPath = path.join(opts.dir, '__msw_sw__.js');
      fs.writeFileSync(outPath, sw);
    },
  };
}
