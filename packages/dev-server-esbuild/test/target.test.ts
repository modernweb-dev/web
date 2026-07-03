import { createTestServer } from '@web/dev-server-core/test-helpers';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { assertIncludes } from '../../../test-helpers/node-test-helpers.js';
import { esbuildPlugin } from '../dist/index.js';

const modernJs = `
class MyClass {
  static myStaticField = 'foo';
  #myPrivateField = 'bar';
  myField = 'x';
}

const myClass = new MyClass();

const optionalChaining = window.bar?.foo;

try {
  // do something
} catch {
  // catch it
}

const spread = {
  ...foo,
  ...bar
};

async function myFunction() {
  await foo;
  await bar;
}
`;

const syntax = {
  classes: 'class MyClass {',
  classFields: ["static myStaticField = 'foo';", "#myPrivateField = 'bar';", "myField = 'x';"],
  optionalChaining: 'const optionalChaining = window.bar?.foo;',
  optionalCatch: '} catch {',
  objectSpread: ['...foo,', '...bar'],
  asyncFunctions: ['async function myFunction() {', 'await foo;', 'await bar;'],
};

const transformedSyntax = {
  classFields: [
    'var __publicField =',
    '__privateAdd(this, _myPrivateField, "bar");',
    '__publicField(this, "myField", "x");',
    '__publicField(MyClass, "myStaticField", "foo");',
  ],
  optionalChaining: 'const optionalChaining = (_a = window.bar) == null ? void 0 : _a.foo;',
  optionalCatch: '} catch (e) {',
  objectSpread: 'const spread = __spreadValues(__spreadValues({}, foo), bar)',
  asyncFunctions: [
    'var __async = (__this, __arguments, generator) => {',
    'return __async(this, null, function* () {',
    'yield foo;',
    'yield bar;',
  ],
};

describe('esbuildPlugin target', () => {
  it('does not transform anything when set to esnext', async () => {
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [
        {
          name: 'test',
          serve(context) {
            if (context.path === '/foo.js') {
              return modernJs;
            }
          },
        },
        esbuildPlugin({ target: 'esnext' }),
      ],
    });

    try {
      const response = await fetch(`${host}/foo.js`);
      const text = await response.text();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(
        response.headers.get('content-type'),
        'application/javascript; charset=utf-8',
      );

      assertIncludes(text, syntax.classes);
      for (const e of syntax.classFields) {
        assertIncludes(text, e);
      }
      assertIncludes(text, syntax.optionalChaining);
      assertIncludes(text, syntax.optionalCatch);
      for (const e of syntax.objectSpread) {
        assertIncludes(text, e);
      }
      for (const e of syntax.asyncFunctions) {
        assertIncludes(text, e);
      }
    } finally {
      server.stop();
    }
  });

  it('can transform to es2020', async () => {
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [
        {
          name: 'test',
          serve(context) {
            if (context.path === '/foo.js') {
              return modernJs;
            }
          },
        },
        esbuildPlugin({ js: true, target: 'es2020' }),
      ],
    });

    try {
      const response = await fetch(`${host}/foo.js`);
      const text = await response.text();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(
        response.headers.get('content-type'),
        'application/javascript; charset=utf-8',
      );

      assertIncludes(text, syntax.classes);
      for (const e of transformedSyntax.classFields) {
        assertIncludes(text, e);
      }
      assertIncludes(text, syntax.optionalChaining);
      assertIncludes(text, syntax.optionalCatch);
      for (const e of syntax.objectSpread) {
        assertIncludes(text, e);
      }
      for (const e of syntax.asyncFunctions) {
        assertIncludes(text, e);
      }
    } finally {
      server.stop();
    }
  });

  it('can transform to es2019', async () => {
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [
        {
          name: 'test',
          serve(context) {
            if (context.path === '/foo.js') {
              return modernJs;
            }
          },
        },
        esbuildPlugin({ js: true, target: 'es2019' }),
      ],
    });

    try {
      const response = await fetch(`${host}/foo.js`);
      const text = await response.text();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(
        response.headers.get('content-type'),
        'application/javascript; charset=utf-8',
      );

      assertIncludes(text, syntax.classes);
      for (const e of transformedSyntax.classFields) {
        assertIncludes(text, e);
      }
      assertIncludes(text, transformedSyntax.optionalChaining);
      assertIncludes(text, syntax.optionalCatch);
      for (const e of syntax.objectSpread) {
        assertIncludes(text, e);
      }
      for (const e of syntax.asyncFunctions) {
        assertIncludes(text, e);
      }
    } finally {
      server.stop();
    }
  });

  it('can transform to es2018', async () => {
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [
        {
          name: 'test',
          serve(context) {
            if (context.path === '/foo.js') {
              return modernJs;
            }
          },
        },
        esbuildPlugin({ js: true, target: 'es2018' }),
      ],
    });

    try {
      const response = await fetch(`${host}/foo.js`);
      const text = await response.text();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(
        response.headers.get('content-type'),
        'application/javascript; charset=utf-8',
      );

      assertIncludes(text, syntax.classes);
      for (const e of transformedSyntax.classFields) {
        assertIncludes(text, e);
      }
      assertIncludes(text, transformedSyntax.optionalChaining);
      assertIncludes(text, transformedSyntax.optionalCatch);
      for (const e of syntax.objectSpread) {
        assertIncludes(text, e);
      }
      for (const e of syntax.asyncFunctions) {
        assertIncludes(text, e);
      }
    } finally {
      server.stop();
    }
  });

  it('can transform to es2017', async () => {
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [
        {
          name: 'test',
          serve(context) {
            if (context.path === '/foo.js') {
              return modernJs;
            }
          },
        },
        esbuildPlugin({ js: true, target: 'es2017' }),
      ],
    });

    try {
      const response = await fetch(`${host}/foo.js`);
      const text = await response.text();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(
        response.headers.get('content-type'),
        'application/javascript; charset=utf-8',
      );

      assertIncludes(text, syntax.classes);
      for (const e of transformedSyntax.classFields) {
        assertIncludes(text, e);
      }
      assertIncludes(text, transformedSyntax.optionalChaining);
      assertIncludes(text, transformedSyntax.optionalCatch);
      assertIncludes(text, transformedSyntax.objectSpread);
      for (const e of syntax.asyncFunctions) {
        assertIncludes(text, e);
      }
    } finally {
      server.stop();
    }
  });

  it('can transform to es2016', async () => {
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [
        {
          name: 'test',
          serve(context) {
            if (context.path === '/foo.js') {
              return modernJs;
            }
          },
        },
        esbuildPlugin({ js: true, target: 'es2016' }),
      ],
    });

    try {
      const response = await fetch(`${host}/foo.js`);
      const text = await response.text();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(
        response.headers.get('content-type'),
        'application/javascript; charset=utf-8',
      );

      assertIncludes(text, syntax.classes);
      for (const e of transformedSyntax.classFields) {
        assertIncludes(text, e);
      }
      assertIncludes(text, transformedSyntax.optionalChaining);
      assertIncludes(text, transformedSyntax.optionalCatch);
      assertIncludes(text, transformedSyntax.objectSpread);
      for (const e of transformedSyntax.asyncFunctions) {
        assertIncludes(text, e);
      }
    } finally {
      server.stop();
    }
  });

  it('can transform inline scripts', async () => {
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [
        {
          name: 'test',
          serve(context) {
            if (context.path === '/index.html') {
              return `<html>
  <body>
    <script type="module">${modernJs}</script>
  </body>
</html>`;
            }
          },
        },
        esbuildPlugin({ js: true, target: 'es2016' }),
      ],
    });

    try {
      const response = await fetch(`${host}/index.html`);
      const text = await response.text();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.headers.get('content-type'), 'text/html; charset=utf-8');

      assertIncludes(text, syntax.classes);
      for (const e of transformedSyntax.classFields) {
        assertIncludes(text, e);
      }
      assertIncludes(text, transformedSyntax.optionalChaining);
      assertIncludes(text, transformedSyntax.optionalCatch);
      assertIncludes(text, transformedSyntax.objectSpread);
      for (const e of transformedSyntax.asyncFunctions) {
        assertIncludes(text, e);
      }
    } finally {
      server.stop();
    }
  });

  it('should leave non-js types as they are', async () => {
    const importmapString = '{"imports":{"foo":"./bar.js"}}';
    const jsonString = '{test:1}';
    const { server, host } = await createTestServer({
      rootDir: import.meta.dirname,
      plugins: [
        {
          name: 'test',
          serve(context) {
            if (context.path === '/index.html') {
              return `<html>
  <body>
    <script type="importmap">${importmapString}</script>
    <script type="application/json">${jsonString}</script>
  </body>
</html>`;
            }
          },
        },
        esbuildPlugin({ js: true, target: 'es2016' }),
      ],
    });

    try {
      const response = await fetch(`${host}/index.html`);
      const text = await response.text();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.headers.get('content-type'), 'text/html; charset=utf-8');
      assertIncludes(text, importmapString);
      assertIncludes(text, jsonString);
    } finally {
      server.stop();
    }
  });
});
