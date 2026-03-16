<<<<<<< HEAD
import { expect } from 'chai';
import { createTestServer } from '@web/dev-server-core/test-helpers';
import { expectIncludes } from '@web/dev-server-core/test-helpers';
||||||| parent of aecfa949 (chore: migrate tests from mocha/chai to node:test + node:assert)
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import path from 'path';
import { createTestServer } from '@web/dev-server-core/test-helpers.js';
import { expectIncludes } from '@web/dev-server-core/test-helpers.js';
=======
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import path from 'path';
<<<<<<< HEAD
import { createTestServer } from '@web/dev-server-core/test-helpers.js';
import { expectIncludes } from '@web/dev-server-core/test-helpers.js';
||||||| parent of 9007e014 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { createTestServer } from '@web/dev-server-core/test-helpers.ts';
import { expectIncludes } from '@web/dev-server-core/test-helpers.ts';
=======
import { createTestServer } from '@web/dev-server-core/test-helpers';
import { expectIncludes } from '@web/dev-server-core/test-helpers';
>>>>>>> 9007e014 (chore: migrate tests from mocha/chai to node:test + node:assert)
>>>>>>> aecfa949 (chore: migrate tests from mocha/chai to node:test + node:assert)

<<<<<<< HEAD
import { esbuildPlugin } from '../src/index.ts';
||||||| parent of aecfa949 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { esbuildPlugin } from '../src/index.js';
=======
<<<<<<< HEAD
import { esbuildPlugin } from '../src/index.js';
||||||| parent of c37bb778 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { esbuildPlugin } from '../src/index.ts';
=======
<<<<<<< HEAD
import { esbuildPlugin } from '../src/index.ts';
||||||| parent of 61bf92a0 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { esbuildPlugin } from '../src/index.js';
=======
import { esbuildPlugin } from '../src/index.ts';
>>>>>>> c37bb778 (chore: migrate tests from mocha/chai to node:test + node:assert)

const __dirname = import.meta.dirname;
>>>>>>> 61bf92a0 (chore: migrate tests from mocha/chai to node:test + node:assert)
>>>>>>> aecfa949 (chore: migrate tests from mocha/chai to node:test + node:assert)

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
