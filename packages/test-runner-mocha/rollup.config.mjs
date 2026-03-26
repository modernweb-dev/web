import { createRequire } from 'module';
import deepmerge from 'deepmerge';
import createConfig from '../../rollup.browser.config.mjs';

const require = createRequire(import.meta.url);

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

const stripRewriteImportExtensionPlugin = {
  name: 'strip-rewrite-import-extension',
  renderChunk(code) {
    // Remove the __rewriteRelativeImportExtension helper and its calls
    // that TypeScript injects when rewriteRelativeImportExtensions is enabled
    code = code.replace(/var __rewriteRelativeImportExtension[^;]*;/g, '');
    // Replace calls with their argument, handling nested parentheses
    const fnName = '__rewriteRelativeImportExtension(';
    let result = '';
    let i = 0;
    while (i < code.length) {
      const idx = code.indexOf(fnName, i);
      if (idx === -1) {
        result += code.slice(i);
        break;
      }
      result += code.slice(i, idx);
      // Find the matching closing paren
      let depth = 1;
      let j = idx + fnName.length;
      while (j < code.length && depth > 0) {
        if (code[j] === '(') depth++;
        else if (code[j] === ')') depth--;
        j++;
      }
      // Extract the argument (everything between the outer parens)
      result += code.slice(idx + fnName.length, j - 1);
      i = j;
    }
    return result;
  },
};

const resolveMochaPlugin = {
  name: 'resolve-mocha',
  resolveId(id) {
    // Resolve mocha using Node's module resolution from this package,
    // rather than relative path traversal which may land in the wrong
    // node_modules in a monorepo
    if (id.endsWith('node_modules/mocha/mocha.js')) {
      return require.resolve('mocha/mocha.js');
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
    plugins: [
      resolveMochaPlugin,
      rewriteDtsPlugin,
      rewriteWebSocketImportPlugin,
      stripRewriteImportExtensionPlugin,
    ],
  }),
  deepmerge(createConfig('src/standalone.ts'), {
    output: {
      paths: {
        // resolve bare import to an absolute import to avoid rollup
        // from normalizing the import relative to the root of the file system
        'wds-socket': '/__web-dev-server__web-socket.js',
      },
    },
    plugins: [
      resolveMochaPlugin,
      rewriteDtsPlugin,
      rewriteWebSocketImportPlugin,
      stripRewriteImportExtensionPlugin,
    ],
  }),
];
