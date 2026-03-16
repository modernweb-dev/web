/// <reference types="../../../types/rollup__plugin-babel" />
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import rollupBabel from '@rollup/plugin-babel';

<<<<<<< HEAD
import { createTestServer, fetchText, expectIncludes } from '../test-helpers.js';
import { fromRollup } from '../../../src/index.js';
||||||| parent of c37bb778 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { createTestServer, fetchText, expectIncludes } from '../test-helpers.ts';
import { fromRollup } from '../../../src/index.ts';
=======
<<<<<<< HEAD
import { createTestServer, fetchText, expectIncludes } from '../test-helpers.ts';
import { fromRollup } from '../../../src/index.ts';
>>>>>>> c37bb778 (chore: migrate tests from mocha/chai to node:test + node:assert)

||||||| parent of 61bf92a0 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { createTestServer, fetchText, expectIncludes } from '../test-helpers.js';
import { fromRollup } from '../../../src/index.js';

=======
import { createTestServer, fetchText, expectIncludes } from '../test-helpers.ts';
import { fromRollup } from '../../../src/index.ts';
>>>>>>> 61bf92a0 (chore: migrate tests from mocha/chai to node:test + node:assert)
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
          plugins: [fileURLToPath(import.meta.resolve('@babel/plugin-transform-template-literals'))],
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
