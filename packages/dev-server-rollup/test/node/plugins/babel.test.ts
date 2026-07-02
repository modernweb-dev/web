/// <reference types="../../../types/rollup__plugin-babel" />
import rollupBabel from '@rollup/plugin-babel';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

import { fromRollup } from '../../../dist/index.js';
import { createTestServer, expectIncludes, fetchText } from '../test-helpers.ts';

const require = createRequire(import.meta.url);

const babel = fromRollup(rollupBabel);

describe('@rollup/plugin-alias', () => {
  it('can resolve imports', async () => {
    const { server, host } = await createTestServer({
      plugins: [
        {
          name: 'test',
          serve(context) {
            if (context.path === '/app.js') {
              return 'const foo = html`bar ${foo} foo`';
            }
          },
        },
        babel({
          babelHelpers: 'inline',
          plugins: [require.resolve('@babel/plugin-transform-template-literals')],
        }),
      ],
    });

    try {
      const text = await fetchText(`${host}/app.js`);
      expectIncludes(text, 'function _taggedTemplateLiteral(');
      expectIncludes(text, '_taggedTemplateLiteral(["bar ", " foo"])');
      expectIncludes(text, 'html(_templateObject');
    } finally {
      server.stop();
    }
  });
});
