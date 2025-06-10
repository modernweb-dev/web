import { expect } from 'chai';
import { createTestServer } from '@web/dev-server-core/test-helpers';
import { expectIncludes } from '@web/dev-server-core/test-helpers';

import { esbuildPlugin } from '../src/index.js';

describe('esbuildPlugin banner/footers', function () {
  this.timeout(5000);

  it('prepends custom banner', async () => {
    const { server, host } = await createTestServer({
      rootDir: __dirname,
      plugins: [
        {
          name: 'test',
          serve(context) {
            if (context.path === '/foo.ts') {
              return `export const foo = 5;`;
            }
          },
        },
        esbuildPlugin({ ts: true, banner: '/* hello there */' }),
      ],
    });

    try {
      const response = await fetch(`${host}/foo.ts`);
      const text = await response.text();

      const indexOfExpr = text.indexOf('export const foo = 5;');
      const indexOfBanner = text.indexOf('/* hello there */');

      expectIncludes(text, '/* hello there */');
      expect(indexOfExpr).to.be.greaterThan(indexOfBanner);
    } finally {
      server.stop();
    }
  });

  it('appends custom footer', async () => {
    const { server, host } = await createTestServer({
      rootDir: __dirname,
      plugins: [
        {
          name: 'test',
          serve(context) {
            if (context.path === '/foo.ts') {
              return `export const foo = 5;`;
            }
          },
        },
        esbuildPlugin({ ts: true, footer: '/* hello there */' }),
      ],
    });

    try {
      const response = await fetch(`${host}/foo.ts`);
      const text = await response.text();

      const indexOfExpr = text.indexOf('export const foo = 5;');
      const indexOfFooter = text.indexOf('/* hello there */');

      expectIncludes(text, '/* hello there */');
      expect(indexOfFooter).to.be.greaterThan(indexOfExpr);
    } finally {
      server.stop();
    }
  });
});
