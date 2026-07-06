/// <reference types="../../../types/rollup-plugin-postcss" />
import { chromeLauncher } from '@web/test-runner-chrome';
import { runTests } from '@web/test-runner-core/test-helpers';
import { describe, it } from 'node:test';
import { resolve } from 'path';
import rollupPostcss from 'rollup-plugin-postcss';

import { assertIncludes, fetchText } from '../../../../../test-helpers/node.js';
import { fromRollup } from '../../../dist/index.js';
import { createTestServer } from '../test-helpers.ts';

const postcss = fromRollup(rollupPostcss);

describe('@rollup/plugin-postcss', () => {
  it('can run postcss on imported css files', async () => {
    const { server, host } = await createTestServer({
      rootDir: resolve(import.meta.dirname, '..', '..', '..', '..', '..'),
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
      assertIncludes(
        text,
        '"\\nhtml {\\n  font-size: 20px;\\n}\\n\\n.foo {\\n  color: blue;\\n}\\n\\n#bar {\\n  color: red;\\n}";',
      );
      assertIncludes(text, 'export default');
      assertIncludes(
        text,
        "import styleInject from './node_modules/style-inject/dist/style-inject.es.js';",
      );
      assertIncludes(text, 'styleInject(css_248z);');
    } finally {
      server.stop();
    }
  });

  it('passes the in-browser tests', { timeout: 40000 }, async () => {
    await runTests({
      files: [resolve(import.meta.dirname, '..', 'fixtures', 'postcss', 'postcss-browser-test.js')],
      browsers: [chromeLauncher()],
      mimeTypes: {
        '**/*.css': 'js',
      },
      plugins: [fromRollup(rollupPostcss)({ modules: true })],
    });
  });
});
