import type { Context } from 'koa';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { assertIncludes } from '../../../../test-helpers/node-test-helpers.js';
import { createTestServer } from '../helpers.ts';

describe('plugin-file-parsed middleware', () => {
  it('is called after other plugin hooks', async () => {
    const order: string[] = [];
    let context: Context | undefined;
    const { host, server } = await createTestServer({
      plugins: [
        {
          name: 'test',
          serve(ctx) {
            order.push('serve');
            if (ctx.path === '/foo.js') {
              return 'import "./bar.js"';
            }
          },
          transform() {
            order.push('transform');
          },
          transformCacheKey() {
            order.push('transformCacheKey');
            return 'js';
          },
          resolveImport() {
            order.push('resolveImport');
          },
          transformImport() {
            order.push('transformImport');
          },
          resolveMimeType() {
            order.push('resolveMimeType');
          },
          fileParsed(_context) {
            context = _context;
            order.push('fileParsed');
          },
        },
      ],
    });

    try {
      const response = await fetch(`${host}/foo.js`);

      assert.equal(response.status, 200);
      assertIncludes(response.headers.get('content-type')!, 'application/javascript');
      assert.equal(order[order.length - 1], 'fileParsed');
      assert.ok(context);
      assert.equal(context!.path, '/foo.js');
    } finally {
      server.stop();
    }
  });
});
