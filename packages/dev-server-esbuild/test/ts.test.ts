import path from 'path';
import { expect } from 'chai';
import fetch from 'node-fetch';
import { createTestServer } from '@web/dev-server-core/test-helpers';
import { expectIncludes, expectNotIncludes } from '@web/dev-server-core/src/test-helpers';

import { esbuildPlugin } from '../src/esbuildPlugin';

describe('esbuildPlugin TS', function () {
  this.timeout(5000);

  it('transforms .ts files', async () => {
    const { server, host } = await createTestServer({
      rootDir: __dirname,
      plugins: [
        {
          name: 'test',
          serve(context) {
            if (context.path === '/foo.ts') {
              return `
      interface MyInterface {
        id: number;
        name: string;
      }
    
      type Foo = number;
    
      export function foo (a: number, b: number): Foo { 
        return a + b 
      }`;
            }
          },
        },
        esbuildPlugin({ ts: true }),
      ],
    });

    try {
      const response = await fetch(`${host}/foo.ts`);
      const text = await response.text();

      expect(response.status).to.equal(200);
      expect(response.headers.get('content-type')).to.equal(
        'application/javascript; charset=utf-8',
      );
      expectIncludes(text, 'export function foo(a, b) {');
      expectIncludes(text, 'return a + b;');
      expectIncludes(text, '}');
      expectNotIncludes(text, 'type Foo');
      expectNotIncludes(text, 'interface MyInterface');
    } finally {
      server.stop();
    }
  });

  it('resolves relative ending with .js to .ts files', async () => {
    const { server, host } = await createTestServer({
      rootDir: path.join(__dirname, 'fixture'),
      plugins: [
        {
          name: 'test',
        },
        esbuildPlugin({ ts: true }),
      ],
    });

    try {
      const response = await fetch(`${host}/a/b/foo.ts`);
      const text = await response.text();

      expect(response.status).to.equal(200);
      expect(response.headers.get('content-type')).to.equal(
        'application/javascript; charset=utf-8',
      );
      expectIncludes(text, 'import "../../x.ts";');
      expectIncludes(text, 'import "../y.ts";');
      expectIncludes(text, 'import "./z.ts";');
    } finally {
      server.stop();
    }
  });

  it('does not change imports where the TS file does not exist', async () => {
    const { server, host } = await createTestServer({
      rootDir: path.join(__dirname, 'fixture'),
      plugins: [
        {
          name: 'test',
        },
        esbuildPlugin({ ts: true }),
      ],
    });

    try {
      const response = await fetch(`${host}/a/b/foo.ts`);
      const text = await response.text();

      expect(response.status).to.equal(200);
      expect(response.headers.get('content-type')).to.equal(
        'application/javascript; charset=utf-8',
      );
      expectIncludes(text, 'import "../../1.js";');
      expectIncludes(text, 'import "../2.js";');
      expectIncludes(text, 'import "./3.js";');

      expectIncludes(text, 'import "../../non-existing-a.js";');
      expectIncludes(text, 'import "../non-existing-b.js";');
      expectIncludes(text, 'import "./non-existing-c.js";');
    } finally {
      server.stop();
    }
  });

  it('does not change imports when ts transform is not enabled', async () => {
    const { server, host } = await createTestServer({
      rootDir: path.join(__dirname, 'fixture'),
      plugins: [
        {
          name: 'test',
        },
        esbuildPlugin({}),
      ],
    });

    try {
      const response = await fetch(`${host}/a/b/foo.ts`);
      const text = await response.text();

      expect(response.status).to.equal(200);
      expectIncludes(text, "import '../../x.js';");
      expectIncludes(text, "import '../y.js';");
      expectIncludes(text, "import './z.js';");
    } finally {
      server.stop();
    }
  });

  it('does not change imports in non-TS files', async () => {
    const { server, host } = await createTestServer({
      rootDir: path.join(__dirname, 'fixture'),
      plugins: [
        {
          name: 'test',
        },
        esbuildPlugin({ ts: true }),
      ],
    });

    try {
      const response = await fetch(`${host}/a/b/bar.js`);
      const text = await response.text();

      expect(response.status).to.equal(200);
      expectIncludes(text, "import '../../x.js';");
      expectIncludes(text, "import '../y.js';");
      expectIncludes(text, "import './z.js';");
    } finally {
      server.stop();
    }
  });
});
