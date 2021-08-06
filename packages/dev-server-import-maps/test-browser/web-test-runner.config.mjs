import { join } from 'path';
import { fileURLToPath } from 'url';
import { importMapsPlugin } from '../index.mjs';

export default {
  rootDir: fileURLToPath(join(import.meta.url, '..', '..', '..', '..')),
  plugins: [
    importMapsPlugin({
      inject: {
        include: '**/*.html',
        importMap: {
          imports: {
            'chai/': '/node_modules/chai/',
            hanbi: '/node_modules/hanbi/lib/main.js',
            '@web/test-runner-mocha': '/packages/test-runner-mocha/dist/standalone.js',
            '@esm-bundle/chai': '/node_modules/@esm-bundle/chai/esm/chai.js',
          },
        },
      },
    }),
  ],
};
