import replace from '@rollup/plugin-replace';

import { createTestServer, fetchText, expectIncludes } from '../test-helpers';
import { rollupAdapter } from '../../src/rollupAdapter';

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
        rollupAdapter(replace({ __buildEnv__: '"production"' })),
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
