import rollupCommonjs from '@rollup/plugin-commonjs';
import { runTests } from '@web/test-runner-core/test-helpers';
import { resolve } from 'path';
import { chromeLauncher } from '@web/test-runner-chrome';

import { createTestServer, fetchText, expectIncludes } from '../test-helpers';
import { fromRollup } from '../../../src/index';

const commonjs = fromRollup(rollupCommonjs);

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
        commonjs(),
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
        commonjs(),
      ],
    });

    try {
      const text = await fetchText(`${host}/foo.js`);
      expectIncludes(text, ' = "bar";');
      expectIncludes(text, ' = "ipsum";');
      expectIncludes(text, 'export default foo;');
      expectIncludes(text, 'foo_1 as foo');
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
        commonjs(),
      ],
    });

    try {
      const text = await fetchText(`${host}/foo.js`);

      expectIncludes(text, 'foo_1 as default');
      expectIncludes(text, 'foo_1 as __moduleExports');
      expectIncludes(text, 'foo_2 as foo');
      expectIncludes(text, 'lorem_1 as lorem');
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
        commonjs(),
      ],
    });

    try {
      const text = await fetchText(`${host}/foo.js`);
      expectIncludes(
        text,
        '/__web-dev-server__/rollup/commonjsHelpers.js?web-dev-server-rollup-null-byte=%00commonjsHelpers.js',
      );
      expectIncludes(text, 'foo.__esModule = true;');
      expectIncludes(text, 'foo.default = void 0;');
      expectIncludes(text, "var _default = 'foo';");
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
        commonjs(),
      ],
    });

    try {
      const text = await fetchText(`${host}/foo.js`);
      expectIncludes(text, 'import "./bar.js";');
      expectIncludes(text, 'export default foo;');
      expectIncludes(text, 'bar_1 as bar');
    } finally {
      server.stop();
    }
  });

  it('passes the in-browser tests', async function () {
    this.timeout(20000);

    await runTests({
      files: [resolve(__dirname, '..', 'fixtures', 'commonjs', 'commonjs-browser-test.js')],
      browsers: [chromeLauncher({ launchOptions: { devtools: false } })],
      plugins: [
        fromRollup(rollupCommonjs)({
          include: '**/commonjs/modules/**/*',
        }),
      ],
    });
  });
});
