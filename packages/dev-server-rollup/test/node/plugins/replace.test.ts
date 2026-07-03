import rollupReplace from '@rollup/plugin-replace';
import { describe, it } from 'node:test';

import { assertIncludes, fetchText } from '../../../../../test-helpers/node-test-helpers.js';
import { fromRollup } from '../../../dist/index.js';
import { createTestServer } from '../test-helpers.ts';

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
      assertIncludes(text, 'if ("production" === "production") { console.log("foo"); }');
    } finally {
      server.stop();
    }
  });
});
