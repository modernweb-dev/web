import { expect } from 'chai';
import { Context } from 'koa';

import { createTestServer } from '../helpers.js';

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

      expect(response.status).to.equal(200);
      expect(response.headers.get('content-type')).to.include('application/javascript');
      expect(order[order.length - 1]).to.equal('fileParsed');
      expect(context).to.exist;
      expect(context!.path).to.equal('/foo.js');
    } finally {
      server.stop();
    }
  });
});
