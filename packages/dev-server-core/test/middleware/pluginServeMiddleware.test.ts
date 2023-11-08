import { expect } from 'chai';

import { createTestServer } from '../helpers.js';

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

      expect(response.status).to.equal(200);
      expect(responseText).to.include('serving non-existing.js');
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

      expect(response.status).to.equal(200);
      expect(responseText).to.include('serve a');
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

      expect(response.status).to.equal(200);
      expect(responseText).to.include('serving non-existing.js');
      expect(response.headers.get('content-type')).to.equal(
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
      expect(response.status).to.equal(200);
      expect(response.headers.get('content-type')).to.equal('text/css; charset=utf-8');
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

      expect(response.status).to.equal(200);
      expect(responseText).to.include('overwritten index.html');
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

      expect(response.status).to.equal(200);
      expect(response.headers.get('x-foo')).to.equal('bar');
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

      expect(response.status).to.equal(200);
      expect(responseText).to.include('serving non-existing.js');
    } finally {
      server.stop();
    }
  });
});
