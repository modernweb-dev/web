import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { expectIncludes, createTestServer } from '@web/dev-server-core/test-helpers';

import { esbuildPlugin } from '../src/index.ts';

const __dirname = import.meta.dirname;

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

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.headers.get('content-type'), 'text/javascript; charset=utf-8');
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
