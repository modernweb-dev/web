// @ts-nocheck

import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export function mockRollupPlugin(
  { interceptor } = {
    interceptor: '',
  },
) {
  return {
    name: 'rollup-plugin-msw',
    writeBundle(opts) {
      const serviceWorkerPath = path.resolve(__dirname, './sw.js');
      const sw = fs.readFileSync(serviceWorkerPath, 'utf8');
      const outPath = path.join(opts.dir, '__msw_sw__.js');
      fs.writeFileSync(outPath, sw);
    },
    buildStart(options) {
      if (interceptor) {
        const htmlPlugin = options.plugins.find(p => p.name === '@web/rollup-plugin-html');

        htmlPlugin.api.addHtmlTransformer(html => {
          return html.replace(
            '<head>',
            `<head><!-- Injected by @web/mocks mockRollupPlugin --><script>${interceptor}</script>`,
          );
        });
      }
    },
  };
}
