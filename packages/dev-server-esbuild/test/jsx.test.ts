import { expect } from 'chai';
import { expectIncludes, createTestServer } from '@web/dev-server-core/test-helpers';

import { esbuildPlugin } from '../src/index.js';

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

      expect(response.status).to.equal(200);
      expect(response.headers.get('content-type')).to.equal(
        'application/javascript; charset=utf-8',
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

      expect(response.status).to.equal(200);
      expect(response.headers.get('content-type')).to.equal(
        'application/javascript; charset=utf-8',
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
