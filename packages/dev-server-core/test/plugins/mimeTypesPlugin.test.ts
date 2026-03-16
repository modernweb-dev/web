import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'path';

<<<<<<< HEAD
import { createTestServer } from '../helpers.js';
||||||| parent of c37bb778 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { createTestServer } from '../helpers.ts';
=======
<<<<<<< HEAD
import { createTestServer } from '../helpers.ts';
||||||| parent of 61bf92a0 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { createTestServer } from '../helpers.js';
=======
import { createTestServer } from '../helpers.ts';

const __dirname = import.meta.dirname;
>>>>>>> 61bf92a0 (chore: migrate tests from mocha/chai to node:test + node:assert)
>>>>>>> c37bb778 (chore: migrate tests from mocha/chai to node:test + node:assert)

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
      assert.strictEqual(response.status, 200);
      assert.strictEqual(
        response.headers.get('content-type'),
        'application/javascript; charset=utf-8',
      );
    } finally {
      server.stop();
    }
  });

  it('can resolve literal paths', async () => {
    const { server, host } = await createTestServer({
      rootDir: __dirname,
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
      assert.strictEqual(responseA.status, 200);
      assert.strictEqual(
        responseA.headers.get('content-type'),
        'application/javascript; charset=utf-8',
      );

      const responseB = await fetch(`${host}/x/foo.css`);
      assert.strictEqual(responseB.status, 200);
      assert.notStrictEqual(
        responseB.headers.get('content-type'),
        'application/javascript; charset=utf-8',
      );
    } finally {
      server.stop();
    }
  });
});
