import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { expectIncludes, createTestServer } from '@web/dev-server-core/test-helpers';

import { esbuildPlugin } from '../src/index.ts';

const __dirname = import.meta.dirname;

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
      assert.strictEqual(response.headers.get('content-type'), 'text/javascript; charset=utf-8');
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
      assert.strictEqual(response.headers.get('content-type'), 'text/javascript; charset=utf-8');
      expectIncludes(text, 'h("div", {');
      expectIncludes(text, 'id: "myDiv"');
      expectIncludes(text, 'h(MyElement, {');
      expectIncludes(text, 'foo: bar');
    } finally {
      server.stop();
    }
  });
});
