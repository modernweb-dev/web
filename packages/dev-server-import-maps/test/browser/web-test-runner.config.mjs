import { join } from 'path';
import { fileURLToPath } from 'url';
import { importMapsPlugin } from '../../index.mjs';

export default {
  rootDir: fileURLToPath(join(import.meta.url, '..', '..', '..', '..', '..')),
  plugins: [
    importMapsPlugin({
      inject: {
        include: '**/*.html',
        importMap: {
          imports: {
            'chai/': '/node_modules/chai/',
            sinon: '/node_modules/sinon/pkg/sinon-esm.js',
            '@web/test-runner-mocha': '/packages/test-runner-mocha/dist/standalone.js',
            '@bundled-es-modules/chai': '/node_modules/@bundled-es-modules/chai/index.js',
          },
        },
      },
    }),
  ],
};
