import rollupReplace from '@rollup/plugin-replace';

import { createTestServer, fetchText, expectIncludes } from '../test-helpers';
import { fromRollup } from '../../../src/index';

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
        replace({ __buildEnv__: '"production"', preventAssignment: true }),
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
