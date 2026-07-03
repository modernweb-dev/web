import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { assertIncludes } from '../../../../test-helpers/node-test-helpers.js';
import { createTestServer } from '../helpers.ts';

describe('plugin-mime-type middleware', () => {
  it('can set the mime type of a file with a string', async () => {
    const { host, server } = await createTestServer({
      plugins: [
        {
          name: 'test',
          resolveMimeType(ctx) {
            if (ctx.path === '/src/hello-world.txt') {
              return 'js';
            }
          },
        },
      ],
    });

    try {
      const response = await fetch(`${host}/src/hello-world.txt`);

      assert.equal(response.status, 200);
      assertIncludes(response.headers.get('content-type')!, 'application/javascript');
    } finally {
      server.stop();
    }
  });

  it('can set the mime type of a file with an object', async () => {
    const { host, server } = await createTestServer({
      plugins: [
        {
          name: 'test',
          resolveMimeType(ctx) {
            if (ctx.path === '/src/hello-world.txt') {
              return { type: 'js' };
            }
          },
        },
      ],
    });

    try {
      const response = await fetch(`${host}/src/hello-world.txt`);

      assert.equal(response.status, 200);
      assertIncludes(response.headers.get('content-type')!, 'application/javascript');
    } finally {
      server.stop();
    }
  });
});
