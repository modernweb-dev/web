import rollupCommonjs from '@rollup/plugin-commonjs';
import { chromeLauncher } from '@web/test-runner-chrome';
import { runTests } from '@web/test-runner-core/test-helpers';
import { describe, it } from 'node:test';
import { resolve } from 'path';

import { nodeResolvePlugin } from '@web/dev-server';
import * as path from 'path';
import { assertIncludes, fetchText } from '../../../../../test-helpers/node.js';
import { fromRollup } from '../../../dist/index.js';
import { createTestServer } from '../test-helpers.ts';

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
      assertIncludes(text, 'var foo = "foo";');
      assertIncludes(
        text,
        'export default /*@__PURE__*/commonjsHelpers.getDefaultExportFromCjs(foo)',
      );
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
      assertIncludes(text, 'var foo_1 = foo.foo = "bar"; var lorem = foo.lorem = "ipsum";');
      assertIncludes(
        text,
        'export { foo as __moduleExports, foo_1 as foo, lorem, foo as default };',
      );
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

      assertIncludes(text, 'foo_1.__esModule = true;');
      assertIncludes(text, "const foo = 'bar';");
      assertIncludes(text, 'var foo_2 = foo_1.foo = foo;');
      assertIncludes(text, "const lorem = 'ipsum';");
      assertIncludes(text, 'var lorem_1 = foo_1.lorem = lorem;');
      assertIncludes(
        text,
        'export { foo_1 as __moduleExports, foo_2 as foo, lorem_1 as lorem, foo_1 as default };',
      );
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
      assertIncludes(
        text,
        'import * as commonjsHelpers from "/__web-dev-server__/rollup/commonjsHelpers.js?web-dev-server-rollup-null-byte=%00commonjsHelpers.js";',
      );
      assertIncludes(text, 'foo.__esModule = true;');
      assertIncludes(text, 'var default_1 = foo.default = void 0;');
      assertIncludes(text, "var _default = 'foo';");
      assertIncludes(text, 'default_1 = foo.default = _default;');
      assertIncludes(text, 'export { foo as __moduleExports, default_1 as default };');
    } finally {
      server.stop();
    }
  });

  it('can transform modules which require node-resolved modules', async () => {
    const rootDir = path.resolve(import.meta.dirname, '..', 'fixtures', 'basic');
    const { server, host } = await createTestServer({
      plugins: [
        {
          name: 'test',
          serve(context) {
            if (context.path === '/foo.js') {
              return 'import {expect} from "chai"; export {expect};';
            }
          },
        },
        commonjs(),
        nodeResolvePlugin(rootDir, false, {}),
      ],
    });

    try {
      const text = await fetchText(`${host}/foo.js`);
      assertIncludes(
        text,
        'import {expect} from "/__wds-outside-root__/6/node_modules/chai/index.mjs"',
      );
      assertIncludes(text, 'export {expect};');
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
      assertIncludes(text, 'import require$$0 from "');
      assertIncludes(text, 'const bar = require$$0; var bar_1 = foo.bar = bar;');
      assertIncludes(text, 'export { foo as __moduleExports, bar_1 as bar, foo as default };');
    } finally {
      server.stop();
    }
  });

  it('passes the in-browser tests', { timeout: 40000 }, async () => {
    await runTests({
      files: [
        resolve(import.meta.dirname, '..', 'fixtures', 'commonjs', 'commonjs-browser-test.js'),
      ],
      browsers: [chromeLauncher({ launchOptions: { devtools: false } })],
      plugins: [
        fromRollup(rollupCommonjs)({
          requireReturnsDefault: 'preferred',
          include: '**/commonjs/modules/**/*',
        }),
      ],
    });
  });
});
