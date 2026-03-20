import fs from 'fs';
import path from 'path';
import { rollup } from 'rollup';
import assert from 'node:assert/strict';
import { describe, it, beforeEach, afterEach, mock } from 'node:test';

import { importMetaAssets } from '../src/rollup-plugin-import-meta-assets.ts';

const __dirname = import.meta.dirname;

const outputConfig = {
  format: 'es',
  dir: 'dist',
};

function expectChunk(output, shapshotUrl, chunkName, referencedFiles) {
  const bundleJsSource = fs.readFileSync(path.join(__dirname, shapshotUrl));
  const bundleJs = output.find(({ fileName }) => fileName === chunkName);
  assert.strictEqual(bundleJs.type, 'chunk');
  assert.strictEqual(bundleJs.code, bundleJsSource.toString());
  assert.deepStrictEqual(bundleJs.referencedFiles, referencedFiles);
}

function expectAsset(output, snapshotUrl, assetName, distName) {
  const snapshotSource = fs.readFileSync(path.join(__dirname, snapshotUrl));
  const asset = output.find(({ name }) => name === assetName);
  assert.strictEqual(typeof asset, 'object');
  assert.strictEqual(asset.type, 'asset');
  assert.strictEqual(asset.source.toString(), snapshotSource.toString());
  assert.strictEqual(asset.fileName, distName);
  return distName;
}

describe('rollup-plugin-import-meta-assets', () => {
  let consoleWarnMock;

  beforeEach(() => {
    consoleWarnMock = mock.method(console, 'warn', () => {});
  });

  afterEach(() => {
    mock.restoreAll();
  });

  it("simple bundle with different new URL('', import.meta.url)", async () => {
    const config = {
      input: { 'simple-bundle': path.resolve(__dirname, './fixtures/simple-entrypoint.js') },
      plugins: [importMetaAssets()],
    };

    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);

    assert.strictEqual(output.length, 6);
    expectChunk(output, 'snapshots/simple-bundle.js', 'simple-bundle.js', [
      expectAsset(output, 'snapshots/one.svg', 'one.svg', 'assets/one-Bkie7h0E.svg'),
      expectAsset(output, 'snapshots/two.svg', 'two.svg', 'assets/two-D7JyS-th.svg'),
      expectAsset(output, 'snapshots/three.svg', 'three.svg', 'assets/three-IN2CmsMK.svg'),
      expectAsset(output, 'snapshots/four.svg', 'four.svg', 'assets/four-CUlW6cvD.svg'),
      expectAsset(output, 'snapshots/five', 'five', 'assets/five-Bnvj_R70'),
    ]);
  });

  it('simple bundle with transform assets', async () => {
    const config = {
      input: { 'transform-bundle': path.resolve(__dirname, './fixtures/transform-entrypoint.js') },
      plugins: [
        importMetaAssets({
          transform: async (assetBuffer, assetPath) => {
            // Only minify SVG files
            return assetPath.endsWith('.svg')
              ? // Fake minification with an XML comment
                assetBuffer.toString() + '<!-- minified -->\n'
              : assetBuffer;
          },
        }),
      ],
    };

    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);

    assert.strictEqual(output.length, 6);
    expectChunk(output, 'snapshots/transform-bundle.js', 'transform-bundle.js', [
      expectAsset(output, 'snapshots/one.min.svg', 'one.svg', 'assets/one--RhQWA3U.svg'),
      expectAsset(output, 'snapshots/two.min.svg', 'two.svg', 'assets/two-CZdxIUwi.svg'),
      expectAsset(output, 'snapshots/three.min.svg', 'three.svg', 'assets/three-tFhyRH_R.svg'),
      expectAsset(output, 'snapshots/four.min.svg', 'four.svg', 'assets/four-Cs1OId-q.svg'),
      expectAsset(output, 'snapshots/image.jpg', 'image.jpg', 'assets/image-C92N8yPj.jpg'),
    ]);
  });

  it('simple bundle with ignored assets', async () => {
    const config = {
      input: { 'transform-bundle-ignored': path.resolve(__dirname, './fixtures/transform-entrypoint.js') },
      plugins: [
        importMetaAssets({
          transform: async (assetBuffer, assetPath) => {
            // Only minify SVG files
            return assetPath.endsWith('.svg')
              ? // Fake minification with an XML comment
                assetBuffer.toString() + '<!-- minified -->\n'
              : null;
          },
        }),
      ],
    };

    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);

    assert.strictEqual(output.length, 5);
    expectChunk(output, 'snapshots/transform-bundle-ignored.js', 'transform-bundle-ignored.js', [
      expectAsset(output, 'snapshots/one.min.svg', 'one.svg', 'assets/one--RhQWA3U.svg'),
      expectAsset(output, 'snapshots/two.min.svg', 'two.svg', 'assets/two-CZdxIUwi.svg'),
      expectAsset(output, 'snapshots/three.min.svg', 'three.svg', 'assets/three-tFhyRH_R.svg'),
      expectAsset(output, 'snapshots/four.min.svg', 'four.svg', 'assets/four-Cs1OId-q.svg'),
    ]);
  });

  it('multiple level bundle (downward modules)', async () => {
    const config = {
      input: { 'multi-level-bundle': path.resolve(__dirname, './fixtures/multi-level-entrypoint.js') },
      plugins: [importMetaAssets()],
    };

    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);

    assert.strictEqual(output.length, 5);
    expectChunk(output, 'snapshots/multi-level-bundle.js', 'multi-level-bundle.js', [
      expectAsset(output, 'snapshots/one.svg', 'one.svg', 'assets/one-Bkie7h0E.svg'),
      expectAsset(output, 'snapshots/two.svg', 'two.svg', 'assets/two-D7JyS-th.svg'),
      expectAsset(output, 'snapshots/three.svg', 'three.svg', 'assets/three-IN2CmsMK.svg'),
      expectAsset(output, 'snapshots/four.svg', 'four.svg', 'assets/four-CUlW6cvD.svg'),
    ]);
  });

  it('multiple level bundle (upward modules)', async () => {
    const config = {
      input: {
        'multi-level-bundle': path.resolve(
          __dirname,
          './fixtures/one/two/three/four/multi-level-entrypoint-deep.js',
        ),
      },
      plugins: [importMetaAssets()],
    };

    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);

    assert.strictEqual(output.length, 5);
    expectChunk(output, 'snapshots/multi-level-bundle.js', 'multi-level-bundle.js', [
      expectAsset(output, 'snapshots/one.svg', 'one.svg', 'assets/one-Bkie7h0E.svg'),
      expectAsset(output, 'snapshots/two.svg', 'two.svg', 'assets/two-D7JyS-th.svg'),
      expectAsset(output, 'snapshots/three.svg', 'three.svg', 'assets/three-IN2CmsMK.svg'),
      expectAsset(output, 'snapshots/four.svg', 'four.svg', 'assets/four-CUlW6cvD.svg'),
    ]);
  });

  it('different asset levels', async () => {
    const config = {
      input: {
        'different-asset-levels-bundle': path.resolve(
          __dirname,
          './fixtures/one/two/different-asset-levels-entrypoint.js',
        ),
      },
      plugins: [importMetaAssets()],
    };

    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);

    assert.strictEqual(output.length, 5);
    expectChunk(
      output,
      'snapshots/different-asset-levels-bundle.js',
      'different-asset-levels-bundle.js',
      [
        expectAsset(output, 'snapshots/one.svg', 'one-deep.svg', 'assets/one-deep-Bkie7h0E.svg'),
        expectAsset(output, 'snapshots/two.svg', 'two-deep.svg', 'assets/two-deep-D7JyS-th.svg'),
        expectAsset(
          output,
          'snapshots/three.svg',
          'three-deep.svg',
          'assets/three-deep-IN2CmsMK.svg',
        ),
        expectAsset(output, 'snapshots/four.svg', 'four-deep.svg', 'assets/four-deep-CUlW6cvD.svg'),
      ],
    );
  });

  it('include/exclude options', async () => {
    const config = {
      input: {
        'one-bundle': path.resolve(__dirname, './fixtures/one/one.js'),
        'two-bundle': path.resolve(__dirname, './fixtures/one/two/two.js'),
        'three-bundle': path.resolve(__dirname, './fixtures/one/two/three/three.js'),
        'four-bundle': path.resolve(__dirname, './fixtures/one/two/three/four/four.js'),
      },
      plugins: [
        importMetaAssets({
          // include everything in "*/one/two/**"
          // but exclude "*/one/two/two.js"
          // which means just include "*/one/two/three.js" and "*/one/two/three/four.js"
          include: '**/one/two/**',
          exclude: '**/one/two/two.js',
        }),
      ],
    };

    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);

    // 4 ES modules + 2 assets
    assert.strictEqual(output.length, 6);
    expectChunk(output, 'snapshots/one-bundle.js', 'one-bundle.js', []);
    expectChunk(output, 'snapshots/two-bundle.js', 'two-bundle.js', []);
    expectChunk(output, 'snapshots/three-bundle.js', 'three-bundle.js', [
      expectAsset(output, 'snapshots/three.svg', 'three.svg', 'assets/three-IN2CmsMK.svg'),
    ]);
    expectChunk(output, 'snapshots/four-bundle.js', 'four-bundle.js', [
      expectAsset(output, 'snapshots/four.svg', 'four.svg', 'assets/four-CUlW6cvD.svg'),
    ]);
  });

  it('bad URL example', async () => {
    const config = {
      input: { 'bad-url-bundle': path.resolve(__dirname, './fixtures/bad-url-entrypoint.js') },
      plugins: [importMetaAssets()],
    };

    let error;

    try {
      const bundle = await rollup(config);
      await bundle.generate(outputConfig);
    } catch (e) {
      error = e;
    }

    assert.match(error.message, /no such file or directory/);
  });

  it('bad URL example with warnOnError: true', async () => {
    const config = {
      input: { 'bad-url-bundle': path.resolve(__dirname, './fixtures/bad-url-entrypoint.js') },
      plugins: [importMetaAssets({ warnOnError: true })],
    };

    const bundle = await rollup(config);
    await bundle.generate(outputConfig);

    assert.strictEqual(consoleWarnMock.mock.calls.length, 2);
    assert.match(
      consoleWarnMock.mock.calls[0].arguments[0],
      /ENOENT: no such file or directory, open '.*[/\\]absolute-path\.svg'/,
    );
    assert.match(
      consoleWarnMock.mock.calls[1].arguments[0],
      /ENOENT: no such file or directory, open '.*[/\\]missing-relative-path\.svg'/,
    );
  });

  it('allows backtics and dynamic vars in path', async () => {
    const config = {
      input: { 'dynamic-vars': path.resolve(__dirname, './fixtures/dynamic-vars.js') },
      plugins: [importMetaAssets({ warnOnError: true })],
    };

    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);

    assert.strictEqual(output.length, 4);
    expectChunk(output, 'snapshots/dynamic-vars.js', 'dynamic-vars.js', [
      expectAsset(output, 'snapshots/three.svg', 'three.svg', 'assets/three-IN2CmsMK.svg'),
      expectAsset(output, 'snapshots/two.svg', 'two.svg', 'assets/two-D7JyS-th.svg'),
      expectAsset(output, 'snapshots/one.svg', 'one.svg', 'assets/one-Bkie7h0E.svg'),
    ]);
  });

  it('ignores patterns that reference a directory', async () => {
    const config = {
      input: {
        'directories-ignored': path.resolve(__dirname, './fixtures/directories-and-simple-entrypoint.js'),
      },
      plugins: [importMetaAssets()],
    };

    const bundle = await rollup(config);
    const { output } = await bundle.generate(outputConfig);

    assert.strictEqual(output.length, 5);
    expectChunk(output, 'snapshots/directories-ignored.js', 'directories-ignored.js', [
      expectAsset(output, 'snapshots/one.svg', 'one.svg', 'assets/one-Bkie7h0E.svg'),
      expectAsset(output, 'snapshots/two.svg', 'two.svg', 'assets/two-D7JyS-th.svg'),
      expectAsset(output, 'snapshots/three.svg', 'three.svg', 'assets/three-IN2CmsMK.svg'),
      expectAsset(output, 'snapshots/four.svg', 'four.svg', 'assets/four-CUlW6cvD.svg'),
    ]);
  });
});
