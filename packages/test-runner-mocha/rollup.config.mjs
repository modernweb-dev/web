import deepmerge from 'deepmerge';
import createConfig from '../../rollup.browser.config.mjs';

const REGEXP_DTS_MOCHA = /'..\/..\/..\/node_modules\/mocha\/mocha.js'/g;
const REGEXP_DTS_CORE = /'..\/..\/test-runner-core\/browser\/session.js'/g;

const rewriteDtsPlugin = {
  generateBundle(options, bundle) {
    for (const [name, file] of Object.entries(bundle)) {
      if (name.endsWith('.d.ts')) {
        file.source = file.source
          .replace(REGEXP_DTS_MOCHA, "'mocha/mocha.js'")
          .replace(REGEXP_DTS_CORE, "'@web/test-runner-core/browser/session.js'");
      }
    }
  },
};

const rewriteWebSocketImportPlugin = {
  resolveId(id) {
    if (id === '/__web-dev-server__web-socket.js') {
      // rollup treats external absolute paths as relative to the root of the file sytem,
      // while we want to preserve the absolute path. we use a bare import which is mapped
      // again later
      return { id: 'wds-socket', external: true };
    }
  },
};

export default [
  deepmerge(createConfig('src/autorun.ts'), {
    output: {
      paths: {
        // resolve bare import to an absolute import to avoid rollup
        // from normalizing the import relative to the root of the file system
        'wds-socket': '/__web-dev-server__web-socket.js',
      },
    },
    plugins: [rewriteDtsPlugin, rewriteWebSocketImportPlugin],
  }),
  deepmerge(createConfig('src/standalone.ts'), {
    output: {
      paths: {
        // resolve bare import to an absolute import to avoid rollup
        // from normalizing the import relative to the root of the file system
        'wds-socket': '/__web-dev-server__web-socket.js',
      },
    },
    plugins: [rewriteDtsPlugin, rewriteWebSocketImportPlugin],
  }),
];
