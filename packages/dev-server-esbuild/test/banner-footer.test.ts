import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import path from 'path';
import { createTestServer } from '@web/dev-server-core/test-helpers';
import { expectIncludes } from '@web/dev-server-core/test-helpers';

import { esbuildPlugin } from '../src/index.ts';

const __dirname = import.meta.dirname;

describe('esbuildPlugin banner/footers', function () {
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
      assert.ok(indexOfExpr > indexOfBanner);
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
      assert.ok(indexOfFooter > indexOfExpr);
    } finally {
      server.stop();
    }
  });
});
