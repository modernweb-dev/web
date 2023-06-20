import fs from 'node:fs';
import path from 'node:path';

export function mswRollupPlugin() {
  return {
    name: 'rollup-plugin-msw',
    writeBundle(opts) {
      const sw = fs.readFileSync('./sw.js', 'utf8');
      const outPath = path.join(opts.dir, '__msw_sw__.js');
      fs.writeFileSync(outPath, sw);
    },
  };
}
