/* eslint-disable no-restricted-syntax, no-await-in-loop */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { assertIncludes, fetchText } from '../../../../test-helpers/node-test-helpers.js';
import { createTestServer } from '../helpers.ts';

describe('plugin-transform middleware', () => {
  it('can transform a served file', async () => {
    const { host, server } = await createTestServer({
      plugins: [
        {
          name: 'test',
          transform(ctx) {
            if (ctx.path === '/src/hello-world.txt') {
              return { body: `${ctx.body} injected text` };
            }
          },
        },
      ],
    });

    try {
      const response = await fetch(`${host}/src/hello-world.txt`);
      const responseText = await response.text();

      assert.equal(response.status, 200);
      assert.equal(responseText, 'Hello world! injected text');
    } finally {
      server.stop();
    }
  });

  it('can transform a served file from a plugin', async () => {
    const { host, server } = await createTestServer({
      plugins: [
        {
          name: 'test',
          serve(ctx) {
            if (ctx.path === '/non-existing.js') {
              return { body: 'my non existing file' };
            }
          },

          transform(ctx) {
            if (ctx.path === '/non-existing.js') {
              return { body: `${ctx.body} injected text` };
            }
          },
        },
      ],
    });

    try {
      const response = await fetch(`${host}/non-existing.js`);
      const responseText = await response.text();

      assert.equal(response.status, 200);
      assert.equal(responseText, 'my non existing file injected text');
    } finally {
      server.stop();
    }
  });

  it('multiple plugins can transform a response', async () => {
    const { host, server } = await createTestServer({
      plugins: [
        {
          name: 'test-a',
          transform(ctx) {
            if (ctx.path === '/src/hello-world.txt') {
              return { body: `${ctx.body} INJECT_A` };
            }
          },
        },
        {
          name: 'test-b',
          transform(ctx) {
            if (ctx.path === '/src/hello-world.txt') {
              return { body: `${ctx.body} INJECT_B` };
            }
          },
        },
      ],
    });

    try {
      const response = await fetch(`${host}/src/hello-world.txt`);
      const responseText = await response.text();

      assert.equal(response.status, 200);
      assert.equal(responseText, 'Hello world! INJECT_A INJECT_B');
    } finally {
      server.stop();
    }
  });

  it('only handles 2xx range requests', async () => {
    const { host, server } = await createTestServer({
      plugins: [
        {
          name: 'test',
          transform(ctx) {
            if (ctx.path === '/non-existing.js') {
              return { body: `${ctx.body} injected text` };
            }
          },
        },
      ],
    });

    try {
      const response = await fetch(`${host}/non-existing.js`);
      const responseText = await response.text();

      assert.equal(response.status, 404);
      assert.equal(responseText, 'Not Found');
    } finally {
      server.stop();
    }
  });

  it('can set headers', async () => {
    const { host, server } = await createTestServer({
      plugins: [
        {
          name: 'test',
          transform(ctx) {
            if (ctx.path === '/index.html') {
              return { body: '...', headers: { 'x-foo': 'bar' } };
            }
          },
        },
      ],
    });

    try {
      const response = await fetch(`${host}/index.html`);

      assert.equal(response.status, 200);
      assert.equal(response.headers.get('x-foo'), 'bar');
    } finally {
      server.stop();
    }
  });

  it('caches response bodies when possible, by default', async () => {
    const { host, server } = await createTestServer({
      plugins: [
        {
          name: 'test',
          transform(ctx) {
            if (ctx.path === '/src/hello-world.txt') {
              return { body: `${Date.now()}` };
            }
          },
        },
      ],
    });

    try {
      const responseOne = await fetch(`${host}/src/hello-world.txt`);
      const timestampOne = await responseOne.text();

      const responseTwo = await fetch(`${host}/src/hello-world.txt`);
      const timestampTwo = await responseTwo.text();

      assert.equal(timestampOne, timestampTwo);
    } finally {
      server.stop();
    }
  });

  it('caches response headers', async () => {
    const { host, server } = await createTestServer({
      plugins: [
        {
          name: 'test',

          transform(ctx) {
            if (ctx.path === '/src/foo.js') {
              return { body: 'console.log("foo")', headers: { 'x-foo': 'bar' } };
            }
          },
        },
      ],
    });

    try {
      const responseOne = await fetch(`${host}/src/foo.js`);
      const textOne = await responseOne.text();

      const headersOne = responseOne.headers;

      const responseTwo = await fetch(`${host}/src/foo.js`);
      const textTwo = await responseTwo.text();
      const headersTwo = responseTwo.headers;

      assert.equal(textOne, 'console.log("foo")');
      assert.equal(textTwo, 'console.log("foo")');
      assert.equal(headersOne.get('x-foo'), 'bar');
      assert.deepEqual(
        Object.fromEntries(headersOne.entries()),
        Object.fromEntries(headersTwo.entries()),
      );
    } finally {
      server.stop();
    }
  });

  it('allows users to turn off caching of response body', async () => {
    const { host, server } = await createTestServer({
      plugins: [
        {
          name: 'test',
          transform(ctx) {
            if (ctx.path === '/src/hello-world.txt') {
              return { body: `${Date.now()}`, transformCache: false };
            }
          },
        },
      ],
    });

    try {
      const responseOne = await fetch(`${host}/src/hello-world.txt`);
      const timestampOne = await responseOne.text();

      const responseTwo = await fetch(`${host}/src/hello-world.txt`);
      const timestampTwo = await responseTwo.text();

      assert.notEqual(timestampOne, timestampTwo);
    } finally {
      server.stop();
    }
  });

  it('can return a string', async () => {
    const { host, server } = await createTestServer({
      plugins: [
        {
          name: 'test',
          transform(ctx) {
            if (ctx.path === '/src/hello-world.txt') {
              return `${ctx.body} injected text`;
            }
          },
        },
      ],
    });

    try {
      const response = await fetch(`${host}/src/hello-world.txt`);
      const responseText = await response.text();

      assert.equal(response.status, 200);
      assert.equal(responseText, 'Hello world! injected text');
    } finally {
      server.stop();
    }
  });

  it('plugins can configure cache keys', async () => {
    let callCountA = 0;
    let callCountB = 0;

    const { host, server } = await createTestServer({
      plugins: [
        {
          name: 'test',

          transformCacheKey(context) {
            return context.headers['user-agent'];
          },

          transform(context) {
            if (context.path === '/src/hello-world.txt') {
              if (context.headers['user-agent'] === 'agent-a') {
                callCountA += 1;
                return `${context.body} injected text A ${callCountA}`;
              }

              if (context.headers['user-agent'] === 'agent-b') {
                callCountB += 1;
                return `${context.body} injected text B ${callCountB}`;
              }
            }
          },
        },
      ],
    });

    try {
      const responseA1 = await fetchText(`${host}/src/hello-world.txt`, {
        headers: { 'user-agent': 'agent-a' },
      });
      assertIncludes(responseA1, 'Hello world! injected text A 1');

      const responseB1 = await fetchText(`${host}/src/hello-world.txt`, {
        headers: { 'user-agent': 'agent-b' },
      });
      assertIncludes(responseB1, 'Hello world! injected text B 1');

      const responseA2 = await fetchText(`${host}/src/hello-world.txt`, {
        headers: { 'user-agent': 'agent-a' },
      });
      assertIncludes(responseA2, 'Hello world! injected text A 1');
      assert.equal(callCountA, 1);

      const responseB2 = await fetchText(`${host}/src/hello-world.txt`, {
        headers: { 'user-agent': 'agent-b' },
      });
      assertIncludes(responseB2, 'Hello world! injected text B 1');
      assert.equal(callCountB, 1);
    } finally {
      server.stop();
    }
  });
});
