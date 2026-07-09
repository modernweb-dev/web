import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createTestServer } from '../helpers.ts';

describe('mimeTypesPLugin', () => {
  it('can configure mime types for files', async () => {
    const { server, host } = await createTestServer({
      mimeTypes: {
        '**/*.css': 'js',
      },
      plugins: [
        {
          name: 'test',
          serve(context) {
            if (context.path === '/foo.css') {
              return '';
            }
          },
        },
      ],
    });

    try {
      const response = await fetch(`${host}/foo.css`);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('content-type'), 'application/javascript; charset=utf-8');
    } finally {
      server.stop();
    }
  });

  it('can resolve literal paths', async () => {
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      mimeTypes: {
        'foo.css': 'js',
      },
      plugins: [
        {
          name: 'test',
          serve(context) {
            if (context.path.endsWith('.css')) {
              return '';
            }
          },
        },
      ],
    });

    try {
      const responseA = await fetch(`${host}/foo.css`);
      assert.equal(responseA.status, 200);
      assert.equal(responseA.headers.get('content-type'), 'application/javascript; charset=utf-8');

      const responseB = await fetch(`${host}/x/foo.css`);
      assert.equal(responseB.status, 200);
      assert.notEqual(
        responseB.headers.get('content-type'),
        'application/javascript; charset=utf-8',
      );
    } finally {
      server.stop();
    }
  });
});
