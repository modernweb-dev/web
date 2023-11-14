const fs = require('fs');
const path = require('path');
const rollup = require('rollup');
const { expect } = require('chai');
const hanbi = require('hanbi');

const { importMetaAssets } = require('../src/rollup-plugin-import-meta-assets.js');

const outputConfig = {
  format: 'es',
  dir: 'dist',
};

function expectChunk(output, shapshotUrl, chunkName, referencedFiles) {
  const bundleJsSource = fs.readFileSync(path.join(__dirname, shapshotUrl));
  const bundleJs = output.find(({ fileName }) => fileName === chunkName);
  expect(bundleJs.type).to.equal('chunk');
  expect(bundleJs.code).to.deep.equal(bundleJsSource.toString());
  expect(bundleJs.referencedFiles).to.deep.equal(referencedFiles);
}

function expectAsset(output, snapshotUrl, assetName, distName) {
  const snapshotSource = fs.readFileSync(path.join(__dirname, snapshotUrl));
  const asset = output.find(({ name }) => name === assetName);
  expect(typeof asset).to.equal('object');
  expect(asset.type).to.equal('asset');
  expect(asset.source.toString()).to.equal(snapshotSource.toString());
  expect(asset.fileName).to.equal(distName);
  return distName;
}

describe('rollup-plugin-import-meta-assets', () => {
  let consoleStub;

  beforeEach(() => {
    consoleStub = hanbi.stubMethod(console, 'warn');
  });

  afterEach(() => {
    hanbi.restore();
  });

  it("simple bundle with different new URL('', import.meta.url)", async () => {
    const config = {
      input: { 'simple-bundle': require.resolve('./fixtures/simple-entrypoint.js') },
      plugins: [importMetaAssets()],
    };

    const bundle = await rollup.rollup(config);
    const { output } = await bundle.generate(outputConfig);

    expect(output.length).to.equal(6);
    expectChunk(output, 'snapshots/simple-bundle.js', 'simple-bundle.js', [
      expectAsset(output, 'snapshots/one.svg', 'one.svg', 'assets/one-ZInu4dBJ.svg'),
      expectAsset(output, 'snapshots/two.svg', 'two.svg', 'assets/two--yckvrYd.svg'),
      expectAsset(output, 'snapshots/three.svg', 'three.svg', 'assets/three-CDdgprDC.svg'),
      expectAsset(output, 'snapshots/four.svg', 'four.svg', 'assets/four-lJVunLww.svg'),
      expectAsset(output, 'snapshots/five', 'five', 'assets/five-Z74_0e9C'),
    ]);
  });

  it('simple bundle with transform assets', async () => {
    const config = {
      input: { 'transform-bundle': require.resolve('./fixtures/transform-entrypoint.js') },
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

    const bundle = await rollup.rollup(config);
    const { output } = await bundle.generate(outputConfig);

    expect(output.length).to.equal(6);
    expectChunk(output, 'snapshots/transform-bundle.js', 'transform-bundle.js', [
      expectAsset(output, 'snapshots/one.min.svg', 'one.svg', 'assets/one-PkYUFgN1.svg'),
      expectAsset(output, 'snapshots/two.min.svg', 'two.svg', 'assets/two-mXcSFMIh.svg'),
      expectAsset(output, 'snapshots/three.min.svg', 'three.svg', 'assets/three-LRYckR_0.svg'),
      expectAsset(output, 'snapshots/four.min.svg', 'four.svg', 'assets/four-rNTiHfqi.svg'),
      expectAsset(output, 'snapshots/image.jpg', 'image.jpg', 'assets/image-vdjfMj42.jpg'),
    ]);
  });

  it('simple bundle with ignored assets', async () => {
    const config = {
      input: { 'transform-bundle-ignored': require.resolve('./fixtures/transform-entrypoint.js') },
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

    const bundle = await rollup.rollup(config);
    const { output } = await bundle.generate(outputConfig);

    expect(output.length).to.equal(5);
    expectChunk(output, 'snapshots/transform-bundle-ignored.js', 'transform-bundle-ignored.js', [
      expectAsset(output, 'snapshots/one.min.svg', 'one.svg', 'assets/one-PkYUFgN1.svg'),
      expectAsset(output, 'snapshots/two.min.svg', 'two.svg', 'assets/two-mXcSFMIh.svg'),
      expectAsset(output, 'snapshots/three.min.svg', 'three.svg', 'assets/three-LRYckR_0.svg'),
      expectAsset(output, 'snapshots/four.min.svg', 'four.svg', 'assets/four-rNTiHfqi.svg'),
    ]);
  });

  it('multiple level bundle (downward modules)', async () => {
    const config = {
      input: { 'multi-level-bundle': require.resolve('./fixtures/multi-level-entrypoint.js') },
      plugins: [importMetaAssets()],
    };

    const bundle = await rollup.rollup(config);
    const { output } = await bundle.generate(outputConfig);

    expect(output.length).to.equal(5);
    expectChunk(output, 'snapshots/multi-level-bundle.js', 'multi-level-bundle.js', [
      expectAsset(output, 'snapshots/one.svg', 'one.svg', 'assets/one-ZInu4dBJ.svg'),
      expectAsset(output, 'snapshots/two.svg', 'two.svg', 'assets/two--yckvrYd.svg'),
      expectAsset(output, 'snapshots/three.svg', 'three.svg', 'assets/three-CDdgprDC.svg'),
      expectAsset(output, 'snapshots/four.svg', 'four.svg', 'assets/four-lJVunLww.svg'),
    ]);
  });

  it('multiple level bundle (upward modules)', async () => {
    const config = {
      input: {
        'multi-level-bundle': require.resolve(
          './fixtures/one/two/three/four/multi-level-entrypoint-deep.js',
        ),
      },
      plugins: [importMetaAssets()],
    };

    const bundle = await rollup.rollup(config);
    const { output } = await bundle.generate(outputConfig);

    expect(output.length).to.equal(5);
    expectChunk(output, 'snapshots/multi-level-bundle.js', 'multi-level-bundle.js', [
      expectAsset(output, 'snapshots/one.svg', 'one.svg', 'assets/one-ZInu4dBJ.svg'),
      expectAsset(output, 'snapshots/two.svg', 'two.svg', 'assets/two--yckvrYd.svg'),
      expectAsset(output, 'snapshots/three.svg', 'three.svg', 'assets/three-CDdgprDC.svg'),
      expectAsset(output, 'snapshots/four.svg', 'four.svg', 'assets/four-lJVunLww.svg'),
    ]);
  });

  it('different asset levels', async () => {
    const config = {
      input: {
        'different-asset-levels-bundle': require.resolve(
          './fixtures/one/two/different-asset-levels-entrypoint.js',
        ),
      },
      plugins: [importMetaAssets()],
    };

    const bundle = await rollup.rollup(config);
    const { output } = await bundle.generate(outputConfig);

    expect(output.length).to.equal(5);
    expectChunk(
      output,
      'snapshots/different-asset-levels-bundle.js',
      'different-asset-levels-bundle.js',
      [
        expectAsset(output, 'snapshots/one.svg', 'one-deep.svg', 'assets/one-deep-ZInu4dBJ.svg'),
        expectAsset(output, 'snapshots/two.svg', 'two-deep.svg', 'assets/two-deep--yckvrYd.svg'),
        expectAsset(
          output,
          'snapshots/three.svg',
          'three-deep.svg',
          'assets/three-deep-CDdgprDC.svg',
        ),
        expectAsset(output, 'snapshots/four.svg', 'four-deep.svg', 'assets/four-deep-lJVunLww.svg'),
      ],
    );
  });

  it('include/exclude options', async () => {
    const config = {
      input: {
        'one-bundle': require.resolve('./fixtures/one/one.js'),
        'two-bundle': require.resolve('./fixtures/one/two/two.js'),
        'three-bundle': require.resolve('./fixtures/one/two/three/three.js'),
        'four-bundle': require.resolve('./fixtures/one/two/three/four/four.js'),
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

    const bundle = await rollup.rollup(config);
    const { output } = await bundle.generate(outputConfig);

    // 4 ES modules + 2 assets
    expect(output.length).to.equal(6);
    expectChunk(output, 'snapshots/one-bundle.js', 'one-bundle.js', []);
    expectChunk(output, 'snapshots/two-bundle.js', 'two-bundle.js', []);
    expectChunk(output, 'snapshots/three-bundle.js', 'three-bundle.js', [
      expectAsset(output, 'snapshots/three.svg', 'three.svg', 'assets/three-CDdgprDC.svg'),
    ]);
    expectChunk(output, 'snapshots/four-bundle.js', 'four-bundle.js', [
      expectAsset(output, 'snapshots/four.svg', 'four.svg', 'assets/four-lJVunLww.svg'),
    ]);
  });

  it('bad URL example', async () => {
    const config = {
      input: { 'bad-url-bundle': require.resolve('./fixtures/bad-url-entrypoint.js') },
      plugins: [importMetaAssets()],
    };

    let error;

    try {
      const bundle = await rollup.rollup(config);
      await bundle.generate(outputConfig);
    } catch (e) {
      error = e;
    }

    expect(error.message).to.match(/no such file or directory/);
  });

  it('bad URL example with warnOnError: true', async () => {
    const config = {
      input: { 'bad-url-bundle': require.resolve('./fixtures/bad-url-entrypoint.js') },
      plugins: [importMetaAssets({ warnOnError: true })],
    };

    const bundle = await rollup.rollup(config);
    await bundle.generate(outputConfig);

    expect(consoleStub.callCount).to.equal(2);
    expect(consoleStub.getCall(0).args[0]).to.match(
      /ENOENT: no such file or directory, open '.*[/\\]absolute-path\.svg'/,
    );
    expect(consoleStub.getCall(1).args[0]).to.match(
      /ENOENT: no such file or directory, open '.*[/\\]missing-relative-path\.svg'/,
    );
  });

  it('allows backtics and dynamic vars in path', async () => {
    const config = {
      input: { 'dynamic-vars': require.resolve('./fixtures/dynamic-vars.js') },
      plugins: [importMetaAssets({ warnOnError: true })],
    };

    const bundle = await rollup.rollup(config);
    const { output } = await bundle.generate(outputConfig);

    expect(output.length).to.equal(4);
    expectChunk(output, 'snapshots/dynamic-vars.js', 'dynamic-vars.js', [
      expectAsset(output, 'snapshots/three.svg', 'three.svg', 'assets/three-CDdgprDC.svg'),
      expectAsset(output, 'snapshots/two.svg', 'two.svg', 'assets/two--yckvrYd.svg'),
      expectAsset(output, 'snapshots/one.svg', 'one.svg', 'assets/one-ZInu4dBJ.svg'),
    ]);
  });

  it('ignores patterns that reference a directory', async () => {
    const config = {
      input: {
        'directories-ignored': require.resolve('./fixtures/directories-and-simple-entrypoint.js'),
      },
      plugins: [importMetaAssets()],
    };

    const bundle = await rollup.rollup(config);
    const { output } = await bundle.generate(outputConfig);

    expect(output.length).to.equal(5);
    expectChunk(output, 'snapshots/directories-ignored.js', 'directories-ignored.js', [
      expectAsset(output, 'snapshots/one.svg', 'one.svg', 'assets/one-ZInu4dBJ.svg'),
      expectAsset(output, 'snapshots/two.svg', 'two.svg', 'assets/two--yckvrYd.svg'),
      expectAsset(output, 'snapshots/three.svg', 'three.svg', 'assets/three-CDdgprDC.svg'),
      expectAsset(output, 'snapshots/four.svg', 'four.svg', 'assets/four-lJVunLww.svg'),
    ]);
  });
});
