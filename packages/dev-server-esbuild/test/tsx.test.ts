import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import path from 'path';
<<<<<<< HEAD
import { createTestServer } from '@web/dev-server-core/test-helpers.js';
import { expectIncludes, expectNotIncludes } from '@web/dev-server-core/test-helpers.js';
||||||| parent of 9007e014 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { createTestServer } from '@web/dev-server-core/test-helpers.ts';
import { expectIncludes, expectNotIncludes } from '@web/dev-server-core/test-helpers.ts';
=======
import { createTestServer } from '@web/dev-server-core/test-helpers';
import { expectIncludes, expectNotIncludes } from '@web/dev-server-core/test-helpers';
>>>>>>> 9007e014 (chore: migrate tests from mocha/chai to node:test + node:assert)

import { esbuildPlugin } from '../src/index.ts';

const __dirname = import.meta.dirname;

describe('esbuildPlugin TSX', function () {
  it('transforms .tsx files', async () => {
    const { server, host } = await createTestServer({
      rootDir: __dirname,
      plugins: [
        {
          name: 'test',
          serve(context) {
            if (context.path === '/foo.tsx') {
              return `
interface MyInterface {
  id: number;
  name: string;
}

type Foo = number;

export function foo (a: number, b: number): Foo { 
  return <div id="myDiv"><MyElement foo={bar} /></div>
}`;
            }
          },
        },
        esbuildPlugin({ tsx: true }),
      ],
    });

    try {
      const response = await fetch(`${host}/foo.tsx`);
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
      expectIncludes(text, 'export function foo(a, b) {');
      expectNotIncludes(text, 'type Foo');
      expectNotIncludes(text, 'interface MyInterface');
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
            if (context.path === '/foo.tsx') {
              return `
interface MyInterface {
  id: number;
  name: string;
}

type Foo = number;

export function foo (a: number, b: number): Foo { 
  return <div id="myDiv"><MyElement foo={bar} /></div>
}`;
            }
          },
        },
        esbuildPlugin({ tsx: true, jsxFactory: 'h', jsxFragment: 'Fragment' }),
      ],
    });

    try {
      const response = await fetch(`${host}/foo.tsx`);
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
      expectIncludes(text, 'export function foo(a, b) {');
      expectNotIncludes(text, 'type Foo');
      expectNotIncludes(text, 'interface MyInterface');
    } finally {
      server.stop();
    }
  });
});
