import CleanCSS from 'clean-css';
import deepmerge from 'deepmerge';
import createConfig from '../../rollup.browser.config';

const cssPlugin = {
  transform(code, id) {
    if (id.endsWith('.css')) {
      const minified = new CleanCSS().minify(code);
      return { code: `export default ${JSON.stringify(minified.styles)}`, map: null };
    }
  },
};

export default [
  deepmerge(createConfig('src/autorun.ts'), {
    plugins: [cssPlugin],
  }),
  deepmerge(createConfig('src/standalone.ts'), {
    plugins: [cssPlugin],
  }),
];
