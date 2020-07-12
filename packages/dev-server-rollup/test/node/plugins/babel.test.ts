/// <reference types="../../../types/rollup__plugin-babel" />
import babel from '@rollup/plugin-babel';

import { createTestServer, fetchText, expectIncludes } from '../test-helpers';
import { rollupAdapter } from '../../../src/rollupAdapter';

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
        rollupAdapter(
          babel({
            babelHelpers: 'inline',
            plugins: [require.resolve('@babel/plugin-transform-template-literals')],
          }),
        ),
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
