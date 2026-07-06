import { createTestServer } from '@web/dev-server-core/test-helpers';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { assertIncludes, assertNotIncludes } from '../../../test-helpers/node.js';
import { esbuildPlugin } from '../dist/index.js';

describe('esbuildPlugin TSX', { timeout: 5000 }, () => {
  it('transforms .tsx files', async () => {
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
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
        'application/javascript; charset=utf-8',
      );
      assertIncludes(text, 'React.createElement("div", {');
      assertIncludes(text, 'id: "myDiv"');
      assertIncludes(text, 'React.createElement(MyElement, {');
      assertIncludes(text, 'foo: bar');
      assertIncludes(text, 'export function foo(a, b) {');
      assertNotIncludes(text, 'type Foo');
      assertNotIncludes(text, 'interface MyInterface');
    } finally {
      server.stop();
    }
  });

  it('can set the JSX factory', async () => {
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
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
        'application/javascript; charset=utf-8',
      );
      assertIncludes(text, 'h("div", {');
      assertIncludes(text, 'id: "myDiv"');
      assertIncludes(text, 'h(MyElement, {');
      assertIncludes(text, 'foo: bar');
      assertIncludes(text, 'export function foo(a, b) {');
      assertNotIncludes(text, 'type Foo');
      assertNotIncludes(text, 'interface MyInterface');
    } finally {
      server.stop();
    }
  });
});
