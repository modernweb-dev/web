import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fromRollup } from '@web/dev-server-rollup';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

const virtualMyClassJsPath = path.join(moduleDir, 'virtual', 'virtual-files', 'MyClass.js');
const virtualMyClassMapPath = `${virtualMyClassJsPath}.map`;

const virtualFiles = {
  '/demo/source-maps/virtual/src/MyClass.js': fs.readFileSync(virtualMyClassJsPath, 'utf-8'),
  '/demo/source-maps/virtual/src/MyClass.js.map': fs.readFileSync(virtualMyClassMapPath, 'utf-8'),
};

export default /** @type {import('@web/test-runner').TestRunnerConfig} */ ({
  nodeResolve: true,
  files: [
    'demo/source-maps/bundled/**/*.test.js',
    'demo/source-maps/inline/**/*.test.js',
    'demo/source-maps/separate/**/*.test.js',
    'demo/source-maps/virtual/**/*.test.js',
  ],
  plugins: [
    {
      name: 'serve-virtual',
      serve(context) {
        const code = virtualFiles[context.path];
        if (code) {
          return code;
        }
      },
    },
  ],
});
