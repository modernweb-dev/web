import rollupPostcss from 'rollup-plugin-postcss';
import { chromeLauncher } from '@web/test-runner-chrome';
import { runTests } from '@web/test-runner-core/dist/test-helpers.js';
import { resolve } from 'path';
import { fileURLToPath } from 'node:url';

import { createTestServer, fetchText, expectIncludes } from '../test-helpers.js';
import { fromRollup } from '../../../src/index.js';

const dirname = fileURLToPath(new URL('.', import.meta.url));

const postcss = fromRollup(rollupPostcss);

describe('@rollup/plugin-postcss', () => {
  it('can run postcss on imported css files', async () => {
    const { server, host } = await createTestServer({
      rootDir: resolve(dirname, '..', '..', '..', '..', '..'),
      mimeTypes: {
        '**/*.css': 'js',
      },
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

  it('passes the in-browser tests', async () => {
    await runTests({
      files: [resolve(dirname, '..', 'fixtures', 'postcss', 'postcss-browser-test.js')],
      browsers: [chromeLauncher()],
      mimeTypes: {
        '**/*.css': 'js',
      },
      plugins: [fromRollup(rollupPostcss)({ modules: true })],
    });
  });
});
