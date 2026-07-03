import { describe, it } from 'node:test';
import path from 'path';
import { assertIncludes, fetchText } from '../../../../test-helpers/node-test-helpers.js';
import { rollupBundlePlugin } from '../../dist/rollupBundlePlugin.js';
import { createTestServer } from './test-helpers.ts';

describe('rollupBundlePlugin', () => {
  it('can bundle a single entrypoint', async () => {
    const { server, host } = await createTestServer({
      rootDir: path.join(import.meta.dirname, 'fixtures', 'bundle-basic'),
      plugins: [
        rollupBundlePlugin({
          rollupConfig: {
            input: path.join(import.meta.dirname, 'fixtures', 'bundle-basic', 'a.js'),
          },
        }),
      ],
    });

    try {
      const text = await fetchText(`${host}/a.js`);
      assertIncludes(text, "'c'");
      assertIncludes(text, '`b ${c}`');
      assertIncludes(text, "'d'");
      assertIncludes(text, '`a ${bc} ${d}`');
    } finally {
      server.stop();
    }
  });

  it('can bundle multiple entrypoint', async () => {
    const { server, host } = await createTestServer({
      rootDir: path.join(import.meta.dirname, 'fixtures', 'bundle-multi'),
      plugins: [
        rollupBundlePlugin({
          rollupConfig: {
            input: [
              path.join(import.meta.dirname, 'fixtures', 'bundle-multi', 'a1.js'),
              path.join(import.meta.dirname, 'fixtures', 'bundle-multi', 'a2.js'),
              path.join(import.meta.dirname, 'fixtures', 'bundle-multi', 'a3.js'),
            ],
            output: {
              chunkFileNames: '[name].js',
            },
          },
        }),
      ],
    });

    try {
      const textA1 = await fetchText(`${host}/a1.js`);
      assertIncludes(textA1, "import { b as bc, d } from './__rollup-generated__d.js';");
      assertIncludes(textA1, 'var a1 = `a ${bc} ${d}`;');
      assertIncludes(textA1, 'export { a1 as default };');

      const textA2 = await fetchText(`${host}/a2.js`);
      assertIncludes(textA2, "import { b as bc, d } from './__rollup-generated__d.js';");
      assertIncludes(textA2, 'var a2 = `a ${bc} ${d}`;');
      assertIncludes(textA2, 'export { a2 as default };');

      const textA3 = await fetchText(`${host}/a3.js`);
      assertIncludes(textA3, "import { b as bc, d } from './__rollup-generated__d.js';");
      assertIncludes(textA3, 'var a3 = `a ${bc} ${d}`;');
      assertIncludes(textA3, 'export { a3 as default };');

      const textD = await fetchText(`${host}/__rollup-generated__d.js`);
      assertIncludes(textD, "var c = 'c';");
      assertIncludes(textD, 'var bc = `b ${c}`;');
      assertIncludes(textD, "var d = 'd';");
      assertIncludes(textD, 'export { bc as b, d };');
    } finally {
      server.stop();
    }
  });

  it('can serve regular files not bundled by rollup', async () => {
    const { server, host } = await createTestServer({
      rootDir: path.join(import.meta.dirname, 'fixtures', 'bundle-basic'),
      plugins: [
        rollupBundlePlugin({
          rollupConfig: {
            input: path.join(import.meta.dirname, 'fixtures', 'bundle-basic', 'a.js'),
          },
        }),
      ],
    });

    try {
      const text = await fetchText(`${host}/not-bundled.js`);
      assertIncludes(text, "import a from './a.js';");
      assertIncludes(text, 'export default `not bundled ${a}`;');
    } finally {
      server.stop();
    }
  });

  it('can serve files emitted by a rollup plugin', async () => {
    const { server, host } = await createTestServer({
      rootDir: path.join(import.meta.dirname, 'fixtures', 'bundle-basic'),
      plugins: [
        rollupBundlePlugin({
          rollupConfig: {
            input: path.join(import.meta.dirname, 'fixtures', 'bundle-basic', 'a.js'),
            plugins: [
              {
                name: 'file-plugin',
                buildStart() {
                  this.emitFile({
                    type: 'asset',
                    name: 'foo.json',
                    source: '{ "foo": "bar" }',
                  });
                },
              },
            ],
          },
        }),
      ],
    });

    try {
      const text = await fetchText(`${host}/__rollup-generated__foo.json`);
      assertIncludes(text, '{ "foo": "bar" }');
    } finally {
      server.stop();
    }
  });
});
