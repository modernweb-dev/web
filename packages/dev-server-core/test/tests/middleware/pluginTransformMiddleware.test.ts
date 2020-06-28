/* eslint-disable no-restricted-syntax, no-await-in-loop */
import { expect } from 'chai';
import fetch from 'node-fetch';

import { createTestServer } from '../helpers';

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

      expect(response.status).to.equal(200);
      expect(responseText).to.equal('Hello world! injected text');
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

      expect(response.status).to.equal(200);
      expect(responseText).to.equal('my non existing file injected text');
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

      expect(response.status).to.equal(200);
      expect(responseText).to.equal('Hello world! INJECT_A INJECT_B');
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

      expect(response.status).to.equal(404);
      expect(responseText).to.equal('Not Found');
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

      expect(response.status).to.equal(200);
      expect(response.headers.get('x-foo')).to.equal('bar');
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

      expect(timestampOne).equal(timestampTwo);
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

      expect(timestampOne).to.not.equal(timestampTwo);
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

      expect(response.status).to.equal(200);
      expect(responseText).to.equal('Hello world! injected text');
    } finally {
      server.stop();
    }
  });
});
