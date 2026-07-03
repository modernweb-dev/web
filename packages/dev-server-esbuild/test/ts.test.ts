import { createTestServer } from '@web/dev-server-core/test-helpers';
import { fromRollup } from '@web/dev-server-rollup';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import path from 'path';
import type { Plugin as RollupPlugin } from 'rollup';

import { assertIncludes, assertNotIncludes } from '../../../test-helpers/node-test-helpers.js';
import { esbuildPlugin } from '../dist/index.js';

describe('esbuildPlugin TS', { timeout: 5000 }, () => {
  it('transforms .ts files', async () => {
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
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
      assert.strictEqual(response.status, 200);
      assert.strictEqual(
        response.headers.get('content-type'),
        'application/javascript; charset=utf-8',
      );
      assertIncludes(text, 'export function foo(a, b) {');
      assertIncludes(text, 'return a + b;');
      assertIncludes(text, '}');
      assertNotIncludes(text, 'type Foo');
      assertNotIncludes(text, 'interface MyInterface');
    } finally {
      server.stop();
    }
  });

  it('transforms TS decorators', async () => {
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [
        {
          name: 'test',
          serve(context) {
            if (context.path === '/foo.ts') {
              return `
@foo
class Bar {
  @prop
  x = 'y';
}`;
            }
          },
        },
        esbuildPlugin({
          ts: true,
          tsconfig: path.join(
            import.meta.dirname,
            'fixture',
            'tsconfig-with-experimental-decorators.json',
          ),
        }),
      ],
    });

    try {
      const response = await fetch(`${host}/foo.ts`);
      const text = await response.text();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(
        response.headers.get('content-type'),
        'application/javascript; charset=utf-8',
      );
      assertIncludes(text, '__decorate');
      assertIncludes(text, '__publicField(this, "x", "y");');
      assertIncludes(
        text,
        `__decorateClass([
  prop
], Bar.prototype, "x", 2);`,
      );
      assertIncludes(
        text,
        `Bar = __decorateClass([
  foo
], Bar);`,
      );
    } finally {
      server.stop();
    }
  });

  it('resolves relative ending with .js to .ts files', async () => {
    const { server, host } = await createTestServer({
      rootDir: path.join(import.meta.dirname, 'fixture'),
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

      assert.strictEqual(response.status, 200);
      assert.strictEqual(
        response.headers.get('content-type'),
        'application/javascript; charset=utf-8',
      );
      assertIncludes(text, 'import "../../x.ts";');
      assertIncludes(text, 'import "../y.ts";');
      assertIncludes(text, 'import "./z.ts";');
    } finally {
      server.stop();
    }
  });

  it('does not change imports where the TS file does not exist', async () => {
    const { server, host } = await createTestServer({
      rootDir: path.join(import.meta.dirname, 'fixture'),
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

      assert.strictEqual(response.status, 200);
      assert.strictEqual(
        response.headers.get('content-type'),
        'application/javascript; charset=utf-8',
      );
      assertIncludes(text, 'import "../../1.js";');
      assertIncludes(text, 'import "../2.js";');
      assertIncludes(text, 'import "./3.js";');

      assertIncludes(text, 'import "../../non-existing-a.js";');
      assertIncludes(text, 'import "../non-existing-b.js";');
      assertIncludes(text, 'import "./non-existing-c.js";');
    } finally {
      server.stop();
    }
  });

  it('does not change imports when ts transform is not enabled', async () => {
    const { server, host } = await createTestServer({
      rootDir: path.join(import.meta.dirname, 'fixture'),
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

      assert.strictEqual(response.status, 200);
      assertIncludes(text, "import '../../x.js';");
      assertIncludes(text, "import '../y.js';");
      assertIncludes(text, "import './z.js';");
    } finally {
      server.stop();
    }
  });

  it('does not change imports in non-TS files', async () => {
    const { server, host } = await createTestServer({
      rootDir: path.join(import.meta.dirname, 'fixture'),
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

      assert.strictEqual(response.status, 200);
      assertIncludes(text, "import '../../x.js';");
      assertIncludes(text, "import '../y.js';");
      assertIncludes(text, "import './z.js';");
    } finally {
      server.stop();
    }
  });

  it('imports with a null byte are rewritten to a special URL', async () => {
    const plugin: RollupPlugin = {
      name: 'my-plugin',
      load(id) {
        if (id === path.join(import.meta.dirname, 'app.js')) {
          return 'import "\0foo.js";';
        }
      },
      resolveId(id) {
        if (id === '\0foo.js') {
          return id;
        }
      },
    };
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [
        fromRollup(() => plugin)(),
        esbuildPlugin({
          js: true,
        }),
      ],
    });

    try {
      const response = await fetch(`${host}/app.js`);
      const text = await response.text();
      assertIncludes(
        text,
        'import "/__web-dev-server__/rollup/foo.js?web-dev-server-rollup-null-byte=%00foo.js"',
      );
    } finally {
      server.stop();
    }
  });

  it('reads tsconfig.json file', async () => {
    const { server, host } = await createTestServer({
      rootDir: path.join(import.meta.dirname, 'fixture'),
      plugins: [
        {
          name: 'test',
        },
        esbuildPlugin({
          ts: true,
          tsconfig: path.join(import.meta.dirname, 'fixture', 'tsconfig.json'),
        }),
      ],
    });

    try {
      const response = await fetch(`${host}/a/b/foo.ts`);
      const text = await response.text();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(
        response.headers.get('content-type'),
        'application/javascript; charset=utf-8',
      );

      assertIncludes(text, '__publicField(this, "prop");');
    } finally {
      server.stop();
    }
  });
});
