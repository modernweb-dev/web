import commonjs from '@rollup/plugin-commonjs';

import { createTestServer, fetchText, expectIncludes } from '../test-helpers';
import { rollupAdapter } from '../../../src/rollupAdapter';

describe('@rollup/plugin-commonjs', () => {
  it('can transform a commonjs module with a default export', async () => {
    const { server, host } = await createTestServer({
      plugins: [
        {
          name: 'test',
          serve(context) {
            if (context.path === '/foo.js') {
              return 'module.exports = "foo";';
            }
          },
        },
        rollupAdapter(commonjs()),
      ],
    });

    try {
      const text = await fetchText(`${host}/foo.js`);
      expectIncludes(text, 'var foo = "foo";');
      expectIncludes(text, 'export default foo;');
    } finally {
      server.stop();
    }
  });

  it('can transform a commonjs module with named export', async () => {
    const { server, host } = await createTestServer({
      plugins: [
        {
          name: 'test',
          serve(context) {
            if (context.path === '/foo.js') {
              return 'module.exports.foo = "bar"; module.exports.lorem = "ipsum";';
            }
          },
        },
        rollupAdapter(commonjs()),
      ],
    });

    try {
      const text = await fetchText(`${host}/foo.js`);
      expectIncludes(text, 'var foo_1 = "bar"; var lorem = "ipsum";');
      expectIncludes(text, 'export default foo;');
      expectIncludes(text, 'export { foo_1 as foo };');
      expectIncludes(text, 'export { lorem };');
    } finally {
      server.stop();
    }
  });

  it('can transform an es module compiled to commonjs module with named exports', async () => {
    const { server, host } = await createTestServer({
      plugins: [
        {
          name: 'test',
          serve(context) {
            if (context.path === '/foo.js') {
              return `
module.exports.__esModule = true;

const foo = 'bar';
module.exports.foo = foo;

const lorem = 'ipsum';
module.exports.lorem = lorem;`;
            }
          },
        },
        rollupAdapter(commonjs()),
      ],
    });

    try {
      const text = await fetchText(`${host}/foo.js`);
      expectIncludes(
        text,
        "import * as commonjsHelpers from '/__web-dev-server__/?web-dev-server-rollup-null-byte=%00commonjsHelpers.js';",
      );
      expectIncludes(text, 'var foo_1 = commonjsHelpers.createCommonjsModule(function (module) {');
      expectIncludes(text, 'module.exports.__esModule = true;');
      expectIncludes(text, "const foo = 'bar';");
      expectIncludes(text, 'module.exports.foo = foo;');
      expectIncludes(text, "const lorem = 'ipsum';");
      expectIncludes(text, 'module.exports.lorem = lorem;');
      expectIncludes(text, 'export default /*@__PURE__*/commonjsHelpers.unwrapExports(foo_1);');
    } finally {
      server.stop();
    }
  });

  it('can transform an es module compiled to commonjs module with a default exports', async () => {
    const { server, host } = await createTestServer({
      plugins: [
        {
          name: 'test',
          serve(context) {
            if (context.path === '/foo.js') {
              return `
exports.__esModule = true;
exports.default = void 0;
var _default = 'foo';
exports.default = _default;`;
            }
          },
        },
        rollupAdapter(commonjs()),
      ],
    });

    try {
      const text = await fetchText(`${host}/foo.js`);
      expectIncludes(
        text,
        "import * as commonjsHelpers from '/__web-dev-server__/?web-dev-server-rollup-null-byte=%00commonjsHelpers.js';",
      );
      expectIncludes(
        text,
        'var foo = commonjsHelpers.createCommonjsModule(function (module, exports) {',
      );
      expectIncludes(text, 'exports.__esModule = true;');
      expectIncludes(text, 'exports.default = void 0;');
      expectIncludes(text, "var _default = 'foo';");
      expectIncludes(text, 'exports.default = _default;');
      expectIncludes(text, 'export default /*@__PURE__*/commonjsHelpers.unwrapExports(foo);');
    } finally {
      server.stop();
    }
  });

  it('can transform modules which require other modules', async () => {
    const { server, host } = await createTestServer({
      plugins: [
        {
          name: 'test',
          resolveImport({ source }) {
            if (source === 'bar') {
              return './bar.js';
            }
            return undefined;
          },
          serve(context) {
            if (context.path === '/foo.js') {
              return 'const bar = require("bar"); module.exports.bar = bar;';
            }
          },
        },
        rollupAdapter(commonjs()),
      ],
    });

    try {
      const text = await fetchText(`${host}/foo.js`);
      expectIncludes(text, "import './bar.js';");
      expectIncludes(
        text,
        "import bar from './bar.js?commonjs-proxy&web-dev-server-rollup-null-byte=%00%2F",
      );
      expectIncludes(text, 'export default foo;');
      expectIncludes(text, 'export { bar_1 as bar };');
    } finally {
      server.stop();
    }
  });
});
