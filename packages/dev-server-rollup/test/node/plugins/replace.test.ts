<<<<<<< HEAD
import rollupReplace from '@rollup/plugin-replace';
||||||| parent of aecfa949 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { describe, it } from 'node:test';
import rollupReplace from '@rollup/plugin-replace.ts';
=======
import { describe, it } from 'node:test';
import rollupReplace from '@rollup/plugin-replace';
>>>>>>> aecfa949 (chore: migrate tests from mocha/chai to node:test + node:assert)

import { createTestServer, fetchText, expectIncludes } from '../test-helpers.js';
import { fromRollup } from '../../../src/index.js';

const replace = fromRollup(rollupReplace as any);

describe('@rollup/plugin-replace', () => {
  it('can resolve imports', async () => {
    const { server, host } = await createTestServer({
      plugins: [
        {
          name: 'test',
          serve() {
            return 'if (__buildEnv__ === "production") { console.log("foo"); }';
          },
        },
        replace({ __buildEnv__: '"production"' }),
      ],
    });

    try {
      const text = await fetchText(`${host}/foo.js`);
      expectIncludes(text, 'if ("production" === "production") { console.log("foo"); }');
    } finally {
      server.stop();
    }
  });
});
