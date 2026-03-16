import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { createTestServer } from '../helpers.ts';

describe('plugin-serve middleware', () => {
  it('can serve non-existing files', async () => {
    const { host, server } = await createTestServer({
      plugins: [
        {
          name: 'test',
          serve(ctx) {
            if (ctx.path === '/non-existing.js') {
              return { body: 'serving non-existing.js' };
            }
          },
        },
      ],
    });

    try {
      const response = await fetch(`${host}/non-existing.js`);
      const responseText = await response.text();

      assert.strictEqual(response.status, 200);
      assert.ok(responseText.includes('serving non-existing.js'));
    } finally {
      server.stop();
    }
  });

  it('the first plugin to serve a file wins', async () => {
    const { host, server } = await createTestServer({
      plugins: [
        {
          name: 'test-a',
          serve(ctx) {
            if (ctx.path === '/non-existing.js') {
              return { body: 'serve a' };
            }
          },
        },
        {
          name: 'test-b',
          serve(ctx) {
            if (ctx.path === '/non-existing.js') {
              return { body: 'serve b' };
            }
          },
        },
      ],
    });

    try {
      const response = await fetch(`${host}/non-existing.js`);
      const responseText = await response.text();

      assert.strictEqual(response.status, 200);
      assert.ok(responseText.includes('serve a'));
    } finally {
      server.stop();
    }
  });

  it('sets a default content type', async () => {
    const { host, server } = await createTestServer({
      plugins: [
        {
          name: 'test',
          serve(ctx) {
            if (ctx.path === '/non-existing.js') {
              return { body: 'serving non-existing.js' };
            }
          },
        },
      ],
    });

    try {
      const response = await fetch(`${host}/non-existing.js`);
      const responseText = await response.text();

      assert.strictEqual(response.status, 200);
      assert.ok(responseText.includes('serving non-existing.js'));
      assert.strictEqual(
        response.headers.get('content-type'),
        'application/javascript; charset=utf-8',
      );
    } finally {
      server.stop();
    }
  });

  it('can set the content type', async () => {
    const { host, server } = await createTestServer({
      plugins: [
        {
          name: 'test',
          serve(ctx) {
            if (ctx.path === '/foo.bar') {
              return { body: 'serving non-existing.html', type: 'css' };
            }
          },
        },
      ],
    });

    try {
      const response = await fetch(`${host}/foo.bar`);
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.headers.get('content-type'), 'text/css; charset=utf-8');
    } finally {
      server.stop();
    }
  });

  it('can overwrite existing files', async () => {
    const { host, server } = await createTestServer({
      plugins: [
        {
          name: 'test',
          serve(ctx) {
            if (ctx.path === '/index.html') {
              return { body: 'overwritten index.html' };
            }
          },
        },
      ],
    });

    try {
      const response = await fetch(`${host}/index.html`);
      const responseText = await response.text();

      assert.strictEqual(response.status, 200);
      assert.ok(responseText.includes('overwritten index.html'));
    } finally {
      server.stop();
    }
  });

  it('can set headers', async () => {
    const { host, server } = await createTestServer({
      plugins: [
        {
          name: 'test',
          serve(ctx) {
            if (ctx.path === '/index.html') {
              return { body: '...', headers: { 'x-foo': 'bar' } };
            }
          },
        },
      ],
    });

    try {
      const response = await fetch(`${host}/index.html`);

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.headers.get('x-foo'), 'bar');
    } finally {
      server.stop();
    }
  });

  it('can return a tring', async () => {
    const { host, server } = await createTestServer({
      plugins: [
        {
          name: 'test',
          serve(ctx) {
            if (ctx.path === '/non-existing.js') {
              return 'serving non-existing.js';
            }
          },
        },
      ],
    });

    try {
      const response = await fetch(`${host}/non-existing.js`);
      const responseText = await response.text();

      assert.strictEqual(response.status, 200);
      assert.ok(responseText.includes('serving non-existing.js'));
    } finally {
      server.stop();
    }
  });
});
