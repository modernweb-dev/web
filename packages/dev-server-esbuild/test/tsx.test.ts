import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createTestServer } from '@web/dev-server-core/test-helpers';
import { expectIncludes, expectNotIncludes } from '@web/dev-server-core/test-helpers';

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

      assert.equal(response.status, 200);
      assert.equal(response.headers.get('content-type'), 'application/javascript; charset=utf-8');
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

      assert.equal(response.status, 200);
      assert.equal(response.headers.get('content-type'), 'application/javascript; charset=utf-8');
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
