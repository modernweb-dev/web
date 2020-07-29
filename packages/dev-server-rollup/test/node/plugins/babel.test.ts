/// <reference types="../../../types/rollup__plugin-babel" />
import rollupBabel from '@rollup/plugin-babel';

import { createTestServer, fetchText, expectIncludes } from '../test-helpers';
import { fromRollup } from '../../../src/index';

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
      expectIncludes(text, 'function _templateObject() {');
      expectIncludes(text, 'const data = _taggedTemplateLiteral(["bar ", " foo"]);');
      expectIncludes(text, 'function _taggedTemplateLiteral(strings, raw) {');
      expectIncludes(text, 'const foo = html(_templateObject(), foo);');
    } finally {
      server.stop();
    }
  });
});
