/// <reference types="../../../types/rollup-plugin-postcss" />
import rollupPostcss from 'rollup-plugin-postcss';
import { resolve } from 'path';

import { createTestServer, fetchText, expectIncludes } from '../test-helpers';
import { fromRollup } from '../../../src/index';

const postcss = fromRollup(rollupPostcss);

describe('@rollup/plugin-postcss', () => {
  it('can run postcss on imported css files', async () => {
    const { server, host } = await createTestServer({
      rootDir: resolve(__dirname, '..', '..', '..', '..', '..'),
      plugins: [
        {
          name: 'serve-css',
          serve(context) {
            if (context.path === '/my-styles.css') {
              return `
html {
  font-size: 20px;
}

.foo {
  color: blue;
}

#bar {
  color: red;
}`;
            }
          },

          resolveMimeType(context) {
            if (context.path.endsWith('.css')) {
              return 'js';
            }
          },
        },
        postcss(),
      ],
    });

    try {
      const text = await fetchText(`${host}/my-styles.css`);
      expectIncludes(
        text,
        '"\\nhtml {\\n  font-size: 20px;\\n}\\n\\n.foo {\\n  color: blue;\\n}\\n\\n#bar {\\n  color: red;\\n}";',
      );
      expectIncludes(text, 'export default');
      expectIncludes(
        text,
        "import styleInject from './node_modules/style-inject/dist/style-inject.es.js';",
      );
      expectIncludes(text, 'styleInject(css_248z);');
    } finally {
      server.stop();
    }
  });
});
