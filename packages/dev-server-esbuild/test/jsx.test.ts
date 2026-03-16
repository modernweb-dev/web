import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import path from 'path';
<<<<<<< HEAD
import { expectIncludes, createTestServer } from '@web/dev-server-core/test-helpers.js';
||||||| parent of 9007e014 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { expectIncludes, createTestServer } from '@web/dev-server-core/test-helpers.ts';
=======
import { expectIncludes, createTestServer } from '@web/dev-server-core/test-helpers';
>>>>>>> 9007e014 (chore: migrate tests from mocha/chai to node:test + node:assert)

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

const __dirname = import.meta.dirname;
>>>>>>> 61bf92a0 (chore: migrate tests from mocha/chai to node:test + node:assert)
>>>>>>> c37bb778 (chore: migrate tests from mocha/chai to node:test + node:assert)

describe('esbuildPlugin JSX', function () {
  it('transforms .jsx files', async () => {
    const { server, host } = await createTestServer({
      rootDir: __dirname,
      plugins: [
        {
          name: 'test',
          serve(context) {
            if (context.path === '/foo.jsx') {
              return `
export function foo(bar) {
  return <div id="myDiv"><MyElement foo={bar} /></div>
}
              `;
            }
          },
        },
        esbuildPlugin({ jsx: true }),
      ],
    });

    try {
      const response = await fetch(`${host}/foo.jsx`);
      const text = await response.text();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(
        response.headers.get('content-type'),
        'text/javascript; charset=utf-8',
      );
      expectIncludes(text, 'React.createElement("div", {');
      expectIncludes(text, 'id: "myDiv"');
      expectIncludes(text, 'React.createElement(MyElement, {');
      expectIncludes(text, 'foo: bar');
    } finally {
      server.stop();
    }
  });

  it('can set the JSX factory', async () => {
    const { server, host } = await createTestServer({
      rootDir: __dirname,
      plugins: [
        {
          name: 'test',
          serve(context) {
            if (context.path === '/foo.jsx') {
              return `
export function foo(bar) {
  return <div id="myDiv"><MyElement foo={bar} /></div>
}
                `;
            }
          },
        },
        esbuildPlugin({ jsx: true, jsxFactory: 'h', jsxFragment: 'Fragment' }),
      ],
    });

    try {
      const response = await fetch(`${host}/foo.jsx`);
      const text = await response.text();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(
        response.headers.get('content-type'),
        'text/javascript; charset=utf-8',
      );
      expectIncludes(text, 'h("div", {');
      expectIncludes(text, 'id: "myDiv"');
      expectIncludes(text, 'h(MyElement, {');
      expectIncludes(text, 'foo: bar');
    } finally {
      server.stop();
    }
  });
});
