import { rollupBundlePlugin } from '../../src/rollupBundlePlugin.js';
import path from 'path';
import { createTestServer, fetchText, expectIncludes } from './test-helpers.js';

describe('rollupBundlePlugin', () => {
  it('can bundle a single entrypoint', async () => {
    const { server, host } = await createTestServer({
      rootDir: path.join(__dirname, 'fixtures', 'bundle-basic'),
      plugins: [
        rollupBundlePlugin({
          rollupConfig: {
            input: path.join(__dirname, 'fixtures', 'bundle-basic', 'a.js'),
          },
        }),
      ],
    });

    try {
      const text = await fetchText(`${host}/a.js`);
      expectIncludes(text, "'c'");
      expectIncludes(text, '`b ${c}`');
      expectIncludes(text, "'d'");
      expectIncludes(text, '`a ${bc} ${d}`');
    } finally {
      server.stop();
    }
  });

  it('can bundle multiple entrypoint', async () => {
    const { server, host } = await createTestServer({
      rootDir: path.join(__dirname, 'fixtures', 'bundle-multi'),
      plugins: [
        rollupBundlePlugin({
          rollupConfig: {
            input: [
              path.join(__dirname, 'fixtures', 'bundle-multi', 'a1.js'),
              path.join(__dirname, 'fixtures', 'bundle-multi', 'a2.js'),
              path.join(__dirname, 'fixtures', 'bundle-multi', 'a3.js'),
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
      expectIncludes(textA1, "import { b as bc, d } from './__rollup-generated__d.js';");
      expectIncludes(textA1, 'var a1 = `a ${bc} ${d}`;');
      expectIncludes(textA1, 'export { a1 as default };');

      const textA2 = await fetchText(`${host}/a2.js`);
      expectIncludes(textA2, "import { b as bc, d } from './__rollup-generated__d.js';");
      expectIncludes(textA2, 'var a2 = `a ${bc} ${d}`;');
      expectIncludes(textA2, 'export { a2 as default };');

      const textA3 = await fetchText(`${host}/a3.js`);
      expectIncludes(textA3, "import { b as bc, d } from './__rollup-generated__d.js';");
      expectIncludes(textA3, 'var a3 = `a ${bc} ${d}`;');
      expectIncludes(textA3, 'export { a3 as default };');

      const textD = await fetchText(`${host}/__rollup-generated__d.js`);
      expectIncludes(textD, "var c = 'c';");
      expectIncludes(textD, 'var bc = `b ${c}`;');
      expectIncludes(textD, "var d = 'd';");
      expectIncludes(textD, 'export { bc as b, d };');
    } finally {
      server.stop();
    }
  });

  it('can serve regular files not bundled by rollup', async () => {
    const { server, host } = await createTestServer({
      rootDir: path.join(__dirname, 'fixtures', 'bundle-basic'),
      plugins: [
        rollupBundlePlugin({
          rollupConfig: {
            input: path.join(__dirname, 'fixtures', 'bundle-basic', 'a.js'),
          },
        }),
      ],
    });

    try {
      const text = await fetchText(`${host}/not-bundled.js`);
      expectIncludes(text, "import a from './a.js';");
      expectIncludes(text, 'export default `not bundled ${a}`;');
    } finally {
      server.stop();
    }
  });

  it('can serve files emitted by a rollup plugin', async () => {
    const { server, host } = await createTestServer({
      rootDir: path.join(__dirname, 'fixtures', 'bundle-basic'),
      plugins: [
        rollupBundlePlugin({
          rollupConfig: {
            input: path.join(__dirname, 'fixtures', 'bundle-basic', 'a.js'),
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
      expectIncludes(text, '{ "foo": "bar" }');
    } finally {
      server.stop();
    }
  });
});
