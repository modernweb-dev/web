import CleanCSS from 'clean-css';
import deepmerge from 'deepmerge';
import createConfig from '../../rollup.browser.config';

const REGEXP_DTS_MOCHA = /'..\/..\/..\/node_modules\/mocha\/mocha.js'/g;
const REGEXP_DTS_CORE = /'..\/..\/test-runner-core\/browser\/session.js'/g;

const cssPlugin = {
  transform(code, id) {
    if (id.endsWith('.css')) {
      const minified = new CleanCSS().minify(code);
      return { code: `export default ${JSON.stringify(minified.styles)}`, map: null };
    }
  },
};

const rewriteDtsPlugin = {
  generateBundle(options, bundle) {
    for (const [name, file] of Object.entries(bundle)) {
      if (name.endsWith('.d.ts')) {
        file.source = file.source
          .replace(REGEXP_DTS_MOCHA, "'mocha/mocha.js'")
          .replace(REGEXP_DTS_CORE, "'@web/test-runner-core'");
      }
    }
  },
};

const rewriteWebSocketImportPlugin = {
  renderChunk(code) {
    // undo rollup rewrite of import path
    return code.replace(
      /['"].*\/__web-dev-server__web-socket\.js['"]/,
      '"/__web-dev-server__web-socket.js"',
    );
  },
};

export default [
  deepmerge(createConfig('src/autorun.ts'), {
    plugins: [cssPlugin, rewriteDtsPlugin, rewriteWebSocketImportPlugin],
  }),
  deepmerge(createConfig('src/standalone.ts'), {
    plugins: [cssPlugin, rewriteDtsPlugin, rewriteWebSocketImportPlugin],
  }),
];
