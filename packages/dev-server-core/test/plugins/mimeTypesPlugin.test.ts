import { expect } from 'chai';

import { createTestServer } from '../helpers.js';

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
      expect(response.status).to.equal(200);
      expect(response.headers.get('content-type')).to.equal(
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
      expect(responseA.status).to.equal(200);
      expect(responseA.headers.get('content-type')).to.equal(
        'application/javascript; charset=utf-8',
      );

      const responseB = await fetch(`${host}/x/foo.css`);
      expect(responseB.status).to.equal(200);
      expect(responseB.headers.get('content-type')).not.to.equal(
        'application/javascript; charset=utf-8',
      );
    } finally {
      server.stop();
    }
  });
});
