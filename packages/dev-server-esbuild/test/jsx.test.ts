import { createTestServer } from '@web/dev-server-core/test-helpers';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { assertIncludes } from '../../../test-helpers/node-test-helpers.js';
import { esbuildPlugin } from '../dist/index.js';

describe('esbuildPlugin JSX', () => {
  it('transforms .jsx files', async () => {
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
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
        'application/javascript; charset=utf-8',
      );
      assertIncludes(text, 'React.createElement("div", {');
      assertIncludes(text, 'id: "myDiv"');
      assertIncludes(text, 'React.createElement(MyElement, {');
      assertIncludes(text, 'foo: bar');
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
        'application/javascript; charset=utf-8',
      );
      assertIncludes(text, 'h("div", {');
      assertIncludes(text, 'id: "myDiv"');
      assertIncludes(text, 'h(MyElement, {');
      assertIncludes(text, 'foo: bar');
    } finally {
      server.stop();
    }
  });
});
