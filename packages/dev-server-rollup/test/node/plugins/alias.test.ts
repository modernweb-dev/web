import alias from '@rollup/plugin-alias';

import { createTestServer, fetchText, expectIncludes } from '../test-helpers';
import { rollupAdapter } from '../../../src/rollupAdapter';

describe('@rollup/plugin-alias', () => {
  it('can resolve imports', async () => {
    const { server, host } = await createTestServer({
      plugins: [
        rollupAdapter(
          alias({
            entries: {
              'module-a': './module-a-stub.js',
            },
          }),
        ),
      ],
    });

    try {
      const text = await fetchText(`${host}/app.js`);
      expectIncludes(text, "import moduleA from './module-a-stub.js'");
    } finally {
      server.stop();
    }
  });
});
