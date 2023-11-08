import { expect } from 'chai';

import { createTestServer } from '../helpers.js';

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

      expect(response.status).to.equal(200);
      expect(response.headers.get('content-type')).to.include('application/javascript');
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

      expect(response.status).to.equal(200);
      expect(response.headers.get('content-type')).to.include('application/javascript');
    } finally {
      server.stop();
    }
  });
});
