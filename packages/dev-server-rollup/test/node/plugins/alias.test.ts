import rollupAlias from '@rollup/plugin-alias';
import { describe, it } from 'node:test';

import { assertIncludes, fetchText } from '../../../../../test-helpers/node.js';
import { fromRollup } from '../../../dist/fromRollup.js';
import { createTestServer } from '../test-helpers.ts';

const alias = fromRollup(rollupAlias);

describe('@rollup/plugin-alias', () => {
  it('can resolve imports', async () => {
    const { server, host } = await createTestServer({
      plugins: [
        alias({
          entries: {
            'module-a': './module-a-stub.js',
          },
        }),
      ],
    });

    try {
      const text = await fetchText(`${host}/app.js`);
      assertIncludes(text, "import moduleA from './module-a-stub.js'");
    } finally {
      server.stop();
    }
  });
});
