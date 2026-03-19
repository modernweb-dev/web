import { expect } from 'chai';
import { expectIncludes, createTestServer } from '@web/dev-server-core/test-helpers';

import { esbuildPlugin } from '../src/index.js';

describe('esbuildPlugin JSON', function () {
  it('transforms .json files', async () => {
    const { server, host } = await createTestServer({
      rootDir: __dirname,
      plugins: [
        {
          name: 'test',
          serve(context) {
            if (context.path === '/foo.json') {
              return '{ "foo": "bar" }';
            }
          },
        },
        esbuildPlugin({ json: true }),
      ],
    });

    try {
      const response = await fetch(`${host}/foo.json`);
      const text = await response.text();

      expect(response.status).to.equal(200);
      expect(response.headers.get('content-type')).to.equal(
        'application/javascript; charset=utf-8',
      );
      expectIncludes(text, 'var foo = "bar";');
      expectIncludes(text, 'var foo_default = { foo };');
      expectIncludes(text, 'export {');
      expectIncludes(text, 'foo_default as default');
      expectIncludes(text, 'foo');
      expectIncludes(text, '}');
    } finally {
      server.stop();
    }
  });
});
