import { createTestServer } from '@web/dev-server-core/test-helpers';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { assertIncludes } from '../../../test-helpers/node.js';
import { esbuildPlugin } from '../dist/index.js';

describe('esbuildPlugin JSON', () => {
  it('transforms .json files', async () => {
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
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
      assert.strictEqual(
        response.headers.get('content-type'),
        'application/javascript; charset=utf-8',
      );
      assertIncludes(text, 'var foo = "bar";');
      assertIncludes(text, 'var foo_default = { foo };');
      assertIncludes(text, 'export {');
      assertIncludes(text, 'foo_default as default');
      assertIncludes(text, 'foo');
      assertIncludes(text, '}');
    } finally {
      server.stop();
    }
  });
});
