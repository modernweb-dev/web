import rollupJson from '@rollup/plugin-json';

import { createTestServer, fetchText, expectIncludes } from '../test-helpers';
import { fromRollup } from '../../../src/index';

const json = fromRollup(rollupJson);

describe('@rollup/plugin-json', () => {
  it('can resolve imports', async () => {
    const { server, host } = await createTestServer({
      plugins: [
        {
          name: 'test',
          serve(context) {
            if (context.path === '/foo.json') {
              return { body: '{ "foo": "bar", "x": [1, 2, 3] }', type: 'js' };
            }
          },
        },
        json(),
      ],
    });

    try {
      const text = await fetchText(`${host}/foo.json`);
      expectIncludes(text, 'export var foo = "bar";');
      expectIncludes(text, 'export var x = [');
    } finally {
      server.stop();
    }
  });
});
