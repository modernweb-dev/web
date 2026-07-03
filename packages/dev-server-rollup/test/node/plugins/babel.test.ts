/// <reference types="../../../types/rollup__plugin-babel" />
import rollupBabel from '@rollup/plugin-babel';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

import { assertIncludes, fetchText } from '../../../../../test-helpers/node-test-helpers.js';
import { fromRollup } from '../../../dist/index.js';
import { createTestServer } from '../test-helpers.ts';

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
      assertIncludes(text, 'function _taggedTemplateLiteral(');
      assertIncludes(text, '_taggedTemplateLiteral(["bar ", " foo"])');
      assertIncludes(text, 'html(_templateObject');
    } finally {
      server.stop();
    }
  });
});
