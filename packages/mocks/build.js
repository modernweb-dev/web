import { createRequire } from 'node:module';
import { copyFile } from 'fs/promises';
import { build } from 'esbuild';

const require = createRequire(import.meta.url);

await build({
  entryPoints: ['msw/msw.js'],
  format: 'esm',
  bundle: true,
  outdir: 'msw/dist',
});

await copyFile(require.resolve('msw/mockServiceWorker.js'), 'msw/dist/mockServiceWorker.js');
