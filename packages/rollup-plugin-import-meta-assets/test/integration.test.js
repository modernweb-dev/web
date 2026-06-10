const { describe, it, beforeEach, afterEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { rollup } = require('rollup');

const { importMetaAssets } = require('../src/rollup-plugin-import-meta-assets.js');
const {
  js,
  svg,
  generateTestBundle,
  createApp,
  cleanApp,
} = require('../../../test-utils/rollup-test-utils.js');

const outputConfig = {
  format: 'es',
  dir: 'dist',
};

describe('rollup-plugin-import-meta-assets', () => {
  let consoleStub;

  beforeEach(() => {
    consoleStub = mock.method(console, 'warn');
  });

  afterEach(() => {
    mock.restoreAll();
    cleanApp();
  });

  it("simple bundle with different new URL('', import.meta.url)", async () => {
    const rootDir = createApp({
      'app.js': js`
        const justUrlObject = new URL('./one.svg', import.meta.url);
        const href = new URL('./two.svg', import.meta.url).href;
        const pathname = new URL('./three.svg', import.meta.url).pathname;
        const searchParams = new URL('./four.svg', import.meta.url).searchParams;
        const noExtension = new URL('./five', import.meta.url);

        console.log({
          justUrlObject,
          href,
          pathname,
          searchParams,
          noExtension,
        });
      `,
      'one.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="red"/></svg>`,
      'two.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="green"/></svg>`,
      'three.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="blue"/></svg>`,
      'four.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="orange"/></svg>`,
      five: 'five',
    });

    const config = {
      input: { app: path.join(rootDir, 'app.js') },
      plugins: [importMetaAssets()],
    };

    const build = await rollup(config);
    const { output, chunks, assets } = await generateTestBundle(build, outputConfig);

    assert.equal(Object.keys(chunks).length, 1);
    assert.equal(Object.keys(assets).length, 5);

    assert.equal(
      chunks['app.js'],
      js`
        const justUrlObject = new URL(
          new URL('assets/one-BCCvKrTe.svg', import.meta.url).href
        );
        const href = new URL(new URL('assets/two-C4stzVZW.svg', import.meta.url).href)
          .href;
        const pathname = new URL(
          new URL('assets/three-DPeYetg3.svg', import.meta.url).href
        ).pathname;
        const searchParams = new URL(
          new URL('assets/four-2QgOKKkO.svg', import.meta.url).href
        ).searchParams;
        const noExtension = new URL(
          new URL('assets/five-DeBsXz7d', import.meta.url).href
        );

        console.log({
          justUrlObject,
          href,
          pathname,
          searchParams,
          noExtension,
        });
      `,
    );

    const appChunk = output.find(({ fileName }) => fileName === 'app.js');
    assert.deepEqual(appChunk.referencedFiles, [
      'assets/one-BCCvKrTe.svg',
      'assets/two-C4stzVZW.svg',
      'assets/three-DPeYetg3.svg',
      'assets/four-2QgOKKkO.svg',
      'assets/five-DeBsXz7d',
    ]);

    assert.equal(
      assets['assets/one-BCCvKrTe.svg'],
      svg`<svg width="1" height="1"><rect width="1" height="1" fill="red"/></svg>`,
    );
    assert.equal(
      assets['assets/two-C4stzVZW.svg'],
      svg`<svg width="1" height="1"><rect width="1" height="1" fill="green"/></svg>`,
    );
    assert.equal(
      assets['assets/three-DPeYetg3.svg'],
      svg`<svg width="1" height="1"><rect width="1" height="1" fill="blue"/></svg>`,
    );
    assert.equal(
      assets['assets/four-2QgOKKkO.svg'],
      svg`<svg width="1" height="1"><rect width="1" height="1" fill="orange"/></svg>`,
    );
    assert.equal(assets['assets/five-DeBsXz7d'], 'five');
  });

  it('simple bundle with transform assets', async () => {
    const rootDir = createApp({
      'app.js': js`
        const justUrlObject = new URL('./one.svg', import.meta.url);
        const href = new URL('./two.svg', import.meta.url).href;
        const pathname = new URL('./three.svg', import.meta.url).pathname;
        const searchParams = new URL('./four.svg', import.meta.url).searchParams;
        const someJpg = new URL('./image.jpg', import.meta.url);

        console.log({
          justUrlObject,
          href,
          pathname,
          searchParams,
          someJpg,
        });
      `,
      'one.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="red"/></svg>`,
      'two.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="green"/></svg>`,
      'three.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="blue"/></svg>`,
      'four.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="orange"/></svg>`,
      'image.jpg': 'image.jpg',
    });

    const config = {
      input: { app: path.join(rootDir, 'app.js') },
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

    const build = await rollup(config);
    const { output, chunks, assets } = await generateTestBundle(build, outputConfig);

    assert.equal(Object.keys(chunks).length, 1);
    assert.equal(Object.keys(assets).length, 5);

    assert.equal(
      chunks['app.js'],
      js`
        const justUrlObject = new URL(
          new URL('assets/one-QPKGlwhS.svg', import.meta.url).href
        );
        const href = new URL(new URL('assets/two-T4ecKj7d.svg', import.meta.url).href)
          .href;
        const pathname = new URL(
          new URL('assets/three-LuNZrcLX.svg', import.meta.url).href
        ).pathname;
        const searchParams = new URL(
          new URL('assets/four-Cf59sBI1.svg', import.meta.url).href
        ).searchParams;
        const someJpg = new URL(
          new URL('assets/image-B360jR14.jpg', import.meta.url).href
        );

        console.log({
          justUrlObject,
          href,
          pathname,
          searchParams,
          someJpg,
        });
      `,
    );

    const appChunk = output.find(({ fileName }) => fileName === 'app.js');
    assert.deepEqual(appChunk.referencedFiles, [
      'assets/one-QPKGlwhS.svg',
      'assets/two-T4ecKj7d.svg',
      'assets/three-LuNZrcLX.svg',
      'assets/four-Cf59sBI1.svg',
      'assets/image-B360jR14.jpg',
    ]);

    assert.equal(
      assets['assets/one-QPKGlwhS.svg'],
      svg`${svg`<svg width="1" height="1"><rect width="1" height="1" fill="red"/></svg>`}<!-- minified -->`,
    );
    assert.equal(
      assets['assets/two-T4ecKj7d.svg'],
      svg`${svg`<svg width="1" height="1"><rect width="1" height="1" fill="green"/></svg>`}<!-- minified -->`,
    );
    assert.equal(
      assets['assets/three-LuNZrcLX.svg'],
      svg`${svg`<svg width="1" height="1"><rect width="1" height="1" fill="blue"/></svg>`}<!-- minified -->`,
    );
    assert.equal(
      assets['assets/four-Cf59sBI1.svg'],
      svg`${svg`<svg width="1" height="1"><rect width="1" height="1" fill="orange"/></svg>`}<!-- minified -->`,
    );
    assert.equal(assets['assets/image-B360jR14.jpg'], 'image.jpg');
  });

  it('simple bundle with ignored assets', async () => {
    const rootDir = createApp({
      'app.js': js`
        const justUrlObject = new URL('./one.svg', import.meta.url);
        const href = new URL('./two.svg', import.meta.url).href;
        const pathname = new URL('./three.svg', import.meta.url).pathname;
        const searchParams = new URL('./four.svg', import.meta.url).searchParams;
        const someJpg = new URL('./image.jpg', import.meta.url);

        console.log({
          justUrlObject,
          href,
          pathname,
          searchParams,
          someJpg,
        });
      `,
      'one.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="red"/></svg>`,
      'two.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="green"/></svg>`,
      'three.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="blue"/></svg>`,
      'four.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="orange"/></svg>`,
      'image.jpg': 'image.jpg',
    });

    const config = {
      input: { app: path.join(rootDir, 'app.js') },
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

    const build = await rollup(config);
    const { output, chunks, assets } = await generateTestBundle(build, outputConfig);

    assert.equal(Object.keys(chunks).length, 1);
    assert.equal(Object.keys(assets).length, 4);

    // image.jpg is NOT transformed, so it keeps original URL
    assert.equal(
      chunks['app.js'],
      js`
        const justUrlObject = new URL(
          new URL('assets/one-QPKGlwhS.svg', import.meta.url).href
        );
        const href = new URL(new URL('assets/two-T4ecKj7d.svg', import.meta.url).href)
          .href;
        const pathname = new URL(
          new URL('assets/three-LuNZrcLX.svg', import.meta.url).href
        ).pathname;
        const searchParams = new URL(
          new URL('assets/four-Cf59sBI1.svg', import.meta.url).href
        ).searchParams;
        const someJpg = new URL('./image.jpg', import.meta.url);

        console.log({
          justUrlObject,
          href,
          pathname,
          searchParams,
          someJpg,
        });
      `,
    );

    const appChunk = output.find(({ fileName }) => fileName === 'app.js');
    assert.deepEqual(appChunk.referencedFiles, [
      'assets/one-QPKGlwhS.svg',
      'assets/two-T4ecKj7d.svg',
      'assets/three-LuNZrcLX.svg',
      'assets/four-Cf59sBI1.svg',
    ]);

    assert.equal(
      assets['assets/one-QPKGlwhS.svg'],
      svg`${svg`<svg width="1" height="1"><rect width="1" height="1" fill="red"/></svg>`}<!-- minified -->`,
    );
    assert.equal(
      assets['assets/two-T4ecKj7d.svg'],
      svg`${svg`<svg width="1" height="1"><rect width="1" height="1" fill="green"/></svg>`}<!-- minified -->`,
    );
    assert.equal(
      assets['assets/three-LuNZrcLX.svg'],
      svg`${svg`<svg width="1" height="1"><rect width="1" height="1" fill="blue"/></svg>`}<!-- minified -->`,
    );
    assert.equal(
      assets['assets/four-Cf59sBI1.svg'],
      svg`${svg`<svg width="1" height="1"><rect width="1" height="1" fill="orange"/></svg>`}<!-- minified -->`,
    );
  });

  it('multiple level bundle (downward modules)', async () => {
    const rootDir = createApp({
      'app.js': js`
        import { imageOne, nameOne } from './one/one.js';
        import { imageTwo, nameTwo } from './one/two/two.js';
        import { imageThree, nameThree } from './one/two/three/three.js';
        import { imageFour, nameFour } from './one/two/three/four/four.js';

        console.log({
          [nameOne]: imageOne,
          [nameTwo]: imageTwo,
          [nameThree]: imageThree,
          [nameFour]: imageFour,
        });
      `,
      'one/one.js': js`
        export const nameOne = 'one-name';
        export const imageOne = new URL('../one.svg', import.meta.url).href;
      `,
      'one/two/two.js': js`
        export const nameTwo = 'two-name';
        export const imageTwo = new URL('../../two.svg', import.meta.url).href;
      `,
      'one/two/three/three.js': js`
        export const nameThree = 'three-name';
        export const imageThree = new URL('../../../three.svg', import.meta.url).href;
      `,
      'one/two/three/four/four.js': js`
        export const nameFour = 'four-name';
        export const imageFour = new URL('../../../../four.svg', import.meta.url).href;
      `,
      'one.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="red"/></svg>`,
      'two.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="green"/></svg>`,
      'three.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="blue"/></svg>`,
      'four.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="orange"/></svg>`,
    });

    const config = {
      input: { app: path.join(rootDir, 'app.js') },
      plugins: [importMetaAssets()],
    };

    const build = await rollup(config);
    const { output, chunks, assets } = await generateTestBundle(build, outputConfig);

    assert.equal(Object.keys(chunks).length, 1);
    assert.equal(Object.keys(assets).length, 4);

    assert.equal(
      chunks['app.js'],
      js`
        const nameOne = 'one-name';
        const imageOne = new URL(
          new URL('assets/one-BCCvKrTe.svg', import.meta.url).href
        ).href;

        const nameTwo = 'two-name';
        const imageTwo = new URL(
          new URL('assets/two-C4stzVZW.svg', import.meta.url).href
        ).href;

        const nameThree = 'three-name';
        const imageThree = new URL(
          new URL('assets/three-DPeYetg3.svg', import.meta.url).href
        ).href;

        const nameFour = 'four-name';
        const imageFour = new URL(
          new URL('assets/four-2QgOKKkO.svg', import.meta.url).href
        ).href;

        console.log({
          [nameOne]: imageOne,
          [nameTwo]: imageTwo,
          [nameThree]: imageThree,
          [nameFour]: imageFour,
        });
      `,
    );

    const appChunk = output.find(({ fileName }) => fileName === 'app.js');
    assert.deepEqual(appChunk.referencedFiles, [
      'assets/one-BCCvKrTe.svg',
      'assets/two-C4stzVZW.svg',
      'assets/three-DPeYetg3.svg',
      'assets/four-2QgOKKkO.svg',
    ]);

    assert.equal(
      assets['assets/one-BCCvKrTe.svg'],
      svg`<svg width="1" height="1"><rect width="1" height="1" fill="red"/></svg>`,
    );
    assert.equal(
      assets['assets/two-C4stzVZW.svg'],
      svg`<svg width="1" height="1"><rect width="1" height="1" fill="green"/></svg>`,
    );
    assert.equal(
      assets['assets/three-DPeYetg3.svg'],
      svg`<svg width="1" height="1"><rect width="1" height="1" fill="blue"/></svg>`,
    );
    assert.equal(
      assets['assets/four-2QgOKKkO.svg'],
      svg`<svg width="1" height="1"><rect width="1" height="1" fill="orange"/></svg>`,
    );
  });

  it('multiple level bundle (upward modules)', async () => {
    const rootDir = createApp({
      'one/two/three/four/app.js': js`
        import { imageOne, nameOne } from '../../../one.js';
        import { imageTwo, nameTwo } from '../../two.js';
        import { imageThree, nameThree } from '../three.js';
        import { imageFour, nameFour } from './four.js';

        console.log({
          [nameOne]: imageOne,
          [nameTwo]: imageTwo,
          [nameThree]: imageThree,
          [nameFour]: imageFour,
        });
      `,
      'one/one.js': js`
        export const nameOne = 'one-name';
        export const imageOne = new URL('../one.svg', import.meta.url).href;
      `,
      'one/two/two.js': js`
        export const nameTwo = 'two-name';
        export const imageTwo = new URL('../../two.svg', import.meta.url).href;
      `,
      'one/two/three/three.js': js`
        export const nameThree = 'three-name';
        export const imageThree = new URL('../../../three.svg', import.meta.url).href;
      `,
      'one/two/three/four/four.js': js`
        export const nameFour = 'four-name';
        export const imageFour = new URL('../../../../four.svg', import.meta.url).href;
      `,
      'one.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="red"/></svg>`,
      'two.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="green"/></svg>`,
      'three.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="blue"/></svg>`,
      'four.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="orange"/></svg>`,
    });

    const config = {
      input: {
        app: path.join(rootDir, 'one/two/three/four/app.js'),
      },
      plugins: [importMetaAssets()],
    };

    const build = await rollup(config);
    const { output, chunks, assets } = await generateTestBundle(build, outputConfig);

    assert.equal(Object.keys(chunks).length, 1);
    assert.equal(Object.keys(assets).length, 4);

    assert.equal(
      chunks['app.js'],
      js`
        const nameOne = 'one-name';
        const imageOne = new URL(
          new URL('assets/one-BCCvKrTe.svg', import.meta.url).href
        ).href;

        const nameTwo = 'two-name';
        const imageTwo = new URL(
          new URL('assets/two-C4stzVZW.svg', import.meta.url).href
        ).href;

        const nameThree = 'three-name';
        const imageThree = new URL(
          new URL('assets/three-DPeYetg3.svg', import.meta.url).href
        ).href;

        const nameFour = 'four-name';
        const imageFour = new URL(
          new URL('assets/four-2QgOKKkO.svg', import.meta.url).href
        ).href;

        console.log({
          [nameOne]: imageOne,
          [nameTwo]: imageTwo,
          [nameThree]: imageThree,
          [nameFour]: imageFour,
        });
      `,
    );

    const appChunk = output.find(({ fileName }) => fileName === 'app.js');
    assert.deepEqual(appChunk.referencedFiles, [
      'assets/one-BCCvKrTe.svg',
      'assets/two-C4stzVZW.svg',
      'assets/three-DPeYetg3.svg',
      'assets/four-2QgOKKkO.svg',
    ]);

    assert.equal(
      assets['assets/one-BCCvKrTe.svg'],
      svg`<svg width="1" height="1"><rect width="1" height="1" fill="red"/></svg>`,
    );
    assert.equal(
      assets['assets/two-C4stzVZW.svg'],
      svg`<svg width="1" height="1"><rect width="1" height="1" fill="green"/></svg>`,
    );
    assert.equal(
      assets['assets/three-DPeYetg3.svg'],
      svg`<svg width="1" height="1"><rect width="1" height="1" fill="blue"/></svg>`,
    );
    assert.equal(
      assets['assets/four-2QgOKKkO.svg'],
      svg`<svg width="1" height="1"><rect width="1" height="1" fill="orange"/></svg>`,
    );
  });

  it('different asset levels', async () => {
    const rootDir = createApp({
      'one/two/app.js': js`
        const nameOne = 'one-name';
        const imageOne = new URL('../one-deep.svg', import.meta.url).href;

        const nameTwo = 'two-name';
        const imageTwo = new URL('./two-deep.svg', import.meta.url).href;

        const nameThree = 'three-name';
        const imageThree = new URL('./three/three-deep.svg', import.meta.url).href;

        const nameFour = 'four-name';
        const imageFour = new URL('./three/four/four-deep.svg', import.meta.url).href;

        console.log({
          [nameOne]: imageOne,
          [nameTwo]: imageTwo,
          [nameThree]: imageThree,
          [nameFour]: imageFour,
        });
      `,
      'one/one-deep.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="red"/></svg>`,
      'one/two/two-deep.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="green"/></svg>`,
      'one/two/three/three-deep.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="blue"/></svg>`,
      'one/two/three/four/four-deep.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="orange"/></svg>`,
    });

    const config = {
      input: {
        app: path.join(rootDir, 'one/two/app.js'),
      },
      plugins: [importMetaAssets()],
    };

    const build = await rollup(config);
    const { output, chunks, assets } = await generateTestBundle(build, outputConfig);

    assert.equal(Object.keys(chunks).length, 1);
    assert.equal(Object.keys(assets).length, 4);

    assert.equal(
      chunks['app.js'],
      js`
        const nameOne = 'one-name';
        const imageOne = new URL(
          new URL('assets/one-deep-BCCvKrTe.svg', import.meta.url).href
        ).href;

        const nameTwo = 'two-name';
        const imageTwo = new URL(
          new URL('assets/two-deep-C4stzVZW.svg', import.meta.url).href
        ).href;

        const nameThree = 'three-name';
        const imageThree = new URL(
          new URL('assets/three-deep-DPeYetg3.svg', import.meta.url).href
        ).href;

        const nameFour = 'four-name';
        const imageFour = new URL(
          new URL('assets/four-deep-2QgOKKkO.svg', import.meta.url).href
        ).href;

        console.log({
          [nameOne]: imageOne,
          [nameTwo]: imageTwo,
          [nameThree]: imageThree,
          [nameFour]: imageFour,
        });
      `,
    );

    const appChunk = output.find(({ fileName }) => fileName === 'app.js');
    assert.deepEqual(appChunk.referencedFiles, [
      'assets/one-deep-BCCvKrTe.svg',
      'assets/two-deep-C4stzVZW.svg',
      'assets/three-deep-DPeYetg3.svg',
      'assets/four-deep-2QgOKKkO.svg',
    ]);

    assert.equal(
      assets['assets/one-deep-BCCvKrTe.svg'],
      svg`<svg width="1" height="1"><rect width="1" height="1" fill="red"/></svg>`,
    );
    assert.equal(
      assets['assets/two-deep-C4stzVZW.svg'],
      svg`<svg width="1" height="1"><rect width="1" height="1" fill="green"/></svg>`,
    );
    assert.equal(
      assets['assets/three-deep-DPeYetg3.svg'],
      svg`<svg width="1" height="1"><rect width="1" height="1" fill="blue"/></svg>`,
    );
    assert.equal(
      assets['assets/four-deep-2QgOKKkO.svg'],
      svg`<svg width="1" height="1"><rect width="1" height="1" fill="orange"/></svg>`,
    );
  });

  it('different asset levels with static paths and preserved output structure', async () => {
    const rootDir = createApp({
      'one/two/app.js': js`
          const nameOne = 'one-name';
          const imageOne = new URL('../one-deep.svg', import.meta.url).href;

          const nameTwo = 'two-name';
          const imageTwo = new URL('./two-deep.svg', import.meta.url).href;

          const nameThree = 'three-name';
          const imageThree = new URL('./three/three-deep.svg', import.meta.url).href;

          const nameFour = 'four-name';
          const imageFour = new URL('./three/four/four-deep.svg', import.meta.url).href;

          console.log({
            [nameOne]: imageOne,
            [nameTwo]: imageTwo,
            [nameThree]: imageThree,
            [nameFour]: imageFour,
          });
        `,
      'one/one-deep.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="red"/></svg>`,
      'one/two/two-deep.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="green"/></svg>`,
      'one/two/three/three-deep.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="blue"/></svg>`,
      'one/two/three/four/four-deep.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="orange"/></svg>`,
    });

    const config = {
      input: {
        app: path.join(rootDir, 'one/two/app.js'),
      },
      plugins: [importMetaAssets()],
    };

    const build = await rollup(config);
    const { output, chunks, assets } = await generateTestBundle(build, {
      ...outputConfig,
      assetFileNames: asset =>
        path.relative(rootDir, asset.originalFileNames[0]).split(path.sep).join('/'),
    });

    assert.equal(Object.keys(chunks).length, 1);
    assert.equal(Object.keys(assets).length, 4);

    assert.equal(
      chunks['app.js'],
      js`
        const nameOne = 'one-name';
        const imageOne = new URL(
          new URL('one/one-deep.svg', import.meta.url).href
        ).href;

        const nameTwo = 'two-name';
        const imageTwo = new URL(
          new URL('one/two/two-deep.svg', import.meta.url).href
        ).href;

        const nameThree = 'three-name';
        const imageThree = new URL(
          new URL('one/two/three/three-deep.svg', import.meta.url).href
        ).href;

        const nameFour = 'four-name';
        const imageFour = new URL(
          new URL(
            'one/two/three/four/four-deep.svg',
            import.meta.url
          ).href
        ).href;

        console.log({
          [nameOne]: imageOne,
          [nameTwo]: imageTwo,
          [nameThree]: imageThree,
          [nameFour]: imageFour,
        });
      `,
    );

    const appChunk = output.find(({ fileName }) => fileName === 'app.js');
    assert.deepEqual(appChunk.referencedFiles, [
      'one/one-deep.svg',
      'one/two/two-deep.svg',
      'one/two/three/three-deep.svg',
      'one/two/three/four/four-deep.svg',
    ]);

    assert.equal(
      assets['one/one-deep.svg'],
      svg`<svg width="1" height="1"><rect width="1" height="1" fill="red"/></svg>`,
    );
    assert.equal(
      assets['one/two/two-deep.svg'],
      svg`<svg width="1" height="1"><rect width="1" height="1" fill="green"/></svg>`,
    );
    assert.equal(
      assets['one/two/three/three-deep.svg'],
      svg`<svg width="1" height="1"><rect width="1" height="1" fill="blue"/></svg>`,
    );
    assert.equal(
      assets['one/two/three/four/four-deep.svg'],
      svg`<svg width="1" height="1"><rect width="1" height="1" fill="orange"/></svg>`,
    );
  });

  it('include/exclude options', async () => {
    const rootDir = createApp({
      'one/one.js': js`
        export const nameOne = 'one-name';
        export const imageOne = new URL('../one.svg', import.meta.url).href;
      `,
      'one/two/two.js': js`
        export const nameTwo = 'two-name';
        export const imageTwo = new URL('../../two.svg', import.meta.url).href;
      `,
      'one/two/three/three.js': js`
        export const nameThree = 'three-name';
        export const imageThree = new URL('../../../three.svg', import.meta.url).href;
      `,
      'one/two/three/four/four.js': js`
        export const nameFour = 'four-name';
        export const imageFour = new URL('../../../../four.svg', import.meta.url).href;
      `,
      'one.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="red"/></svg>`,
      'two.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="green"/></svg>`,
      'three.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="blue"/></svg>`,
      'four.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="orange"/></svg>`,
    });

    const config = {
      input: {
        one: path.join(rootDir, 'one/one.js'),
        two: path.join(rootDir, 'one/two/two.js'),
        three: path.join(rootDir, 'one/two/three/three.js'),
        four: path.join(rootDir, 'one/two/three/four/four.js'),
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

    const build = await rollup(config);
    const { output, chunks, assets } = await generateTestBundle(build, outputConfig);

    assert.equal(Object.keys(chunks).length, 4);
    assert.equal(Object.keys(assets).length, 2);

    // one and two keep original URLs (excluded)
    assert.equal(
      chunks['one.js'],
      js`
        const nameOne = 'one-name';
        const imageOne = new URL('../one.svg', import.meta.url).href;

        export { imageOne, nameOne };
      `,
    );
    assert.equal(
      chunks['two.js'],
      js`
        const nameTwo = 'two-name';
        const imageTwo = new URL('../../two.svg', import.meta.url).href;

        export { imageTwo, nameTwo };
      `,
    );

    // three and four have transformed URLs (included)
    assert.equal(
      chunks['three.js'],
      js`
        const nameThree = 'three-name';
        const imageThree = new URL(
          new URL('assets/three-DPeYetg3.svg', import.meta.url).href
        ).href;

        export { imageThree, nameThree };
      `,
    );
    assert.equal(
      chunks['four.js'],
      js`
        const nameFour = 'four-name';
        const imageFour = new URL(
          new URL('assets/four-2QgOKKkO.svg', import.meta.url).href
        ).href;

        export { imageFour, nameFour };
      `,
    );

    assert.equal(
      assets['assets/three-DPeYetg3.svg'],
      svg`<svg width="1" height="1"><rect width="1" height="1" fill="blue"/></svg>`,
    );
    assert.equal(
      assets['assets/four-2QgOKKkO.svg'],
      svg`<svg width="1" height="1"><rect width="1" height="1" fill="orange"/></svg>`,
    );

    const oneChunk = output.find(({ fileName }) => fileName === 'one.js');
    const twoChunk = output.find(({ fileName }) => fileName === 'two.js');
    const threeChunk = output.find(({ fileName }) => fileName === 'three.js');
    const fourChunk = output.find(({ fileName }) => fileName === 'four.js');

    assert.deepEqual(oneChunk.referencedFiles, []);
    assert.deepEqual(twoChunk.referencedFiles, []);
    assert.deepEqual(threeChunk.referencedFiles, ['assets/three-DPeYetg3.svg']);
    assert.deepEqual(fourChunk.referencedFiles, ['assets/four-2QgOKKkO.svg']);
  });

  it('bad URL example', async () => {
    const rootDir = createApp({
      'app.js': js`
        const badImage1 = new URL('/absolute-path.svg', import.meta.url).href;
        const badImage2 = new URL('../../missing-relative-path.svg', import.meta.url).href;
        console.log(badImage1, badImage2);
      `,
    });

    const config = {
      input: { app: path.join(rootDir, 'app.js') },
      plugins: [importMetaAssets()],
    };

    let error;

    try {
      const build = await rollup(config);
      await build.generate(outputConfig);
    } catch (e) {
      error = e;
    }

    assert.match(error.message, /no such file or directory/);
  });

  it('bad URL example with warnOnError: true', async () => {
    const rootDir = createApp({
      'app.js': js`
        const badImage1 = new URL('/absolute-path.svg', import.meta.url).href;
        const badImage2 = new URL('../../missing-relative-path.svg', import.meta.url).href;
        console.log(badImage1, badImage2);
      `,
    });

    const config = {
      input: { app: path.join(rootDir, 'app.js') },
      plugins: [importMetaAssets({ warnOnError: true })],
    };

    const build = await rollup(config);
    await build.generate(outputConfig);

    assert.equal(consoleStub.mock.callCount(), 2);
    assert.match(
      consoleStub.mock.calls[0].arguments[0],
      /ENOENT: no such file or directory, open '.*[/\\]absolute-path\.svg'/,
    );
    assert.match(
      consoleStub.mock.calls[1].arguments[0],
      /ENOENT: no such file or directory, open '.*[/\\]missing-relative-path\.svg'/,
    );
  });

  it('allows backtics in path', async () => {
    const rootDir = createApp({
      'app.js':
        'const backticksImg = new URL(`./one/one-deep.svg`, import.meta.url);\n\nconsole.log(backticksImg);\n',
      'one/one-deep.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="red"/></svg>`,
    });

    const config = {
      input: { app: path.join(rootDir, 'app.js') },
      plugins: [importMetaAssets({ warnOnError: true })],
    };

    const build = await rollup(config);
    const { output, chunks, assets } = await generateTestBundle(build, outputConfig);

    assert.equal(Object.keys(chunks).length, 1);
    assert.equal(Object.keys(assets).length, 1);

    assert.equal(
      chunks['app.js'],
      js`
        const backticksImg = new URL(
          new URL('assets/one-deep-BCCvKrTe.svg', import.meta.url).href
        );

        console.log(backticksImg);
      `,
    );

    const appChunk = output.find(({ fileName }) => fileName === 'app.js');
    assert.deepEqual(appChunk.referencedFiles, ['assets/one-deep-BCCvKrTe.svg']);

    assert.equal(
      assets['assets/one-deep-BCCvKrTe.svg'],
      svg`<svg width="1" height="1"><rect width="1" height="1" fill="red"/></svg>`,
    );
  });

  it('allows dynamic vars with a concatenated file name', async () => {
    const rootDir = createApp({
      // actual names don't matter, we glob and include everything always
      'app.js': js`
        const images = ['one', 'two'];

        const paths = images.map((name) =>
          new URL(\`./assets/images/image-\${name}.svg\`, import.meta.url),
        );

        console.log(paths);
      `,
      'assets/images/image-one.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="red"/></svg>`,
      'assets/images/image-two.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="green"/></svg>`,
      'assets/images/image-three.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="blue"/></svg>`,
    });

    const config = {
      input: { app: path.join(rootDir, 'app.js') },
      plugins: [importMetaAssets({ warnOnError: true })],
    };

    const build = await rollup(config);
    const { output, chunks, assets } = await generateTestBundle(build, outputConfig);

    assert.equal(Object.keys(chunks).length, 1);
    assert.equal(Object.keys(assets).length, 3);

    assert.equal(
      chunks['app.js'],
      js`
        function __variableDynamicURLRuntime0__(path) {
          switch (path) {
            case './assets/images/image-one.svg':
              return new URL(
                new URL('assets/image-one-BCCvKrTe.svg', import.meta.url).href
              );
            case './assets/images/image-three.svg':
              return new URL(
                new URL('assets/image-three-DPeYetg3.svg', import.meta.url).href
              );
            case './assets/images/image-two.svg':
              return new URL(
                new URL('assets/image-two-C4stzVZW.svg', import.meta.url).href
              );
            default:
              return new Promise(function (resolve, reject) {
                (typeof queueMicrotask === 'function'
                  ? queueMicrotask
                  : setTimeout)(reject.bind(null, new Error('Unknown variable dynamic new URL statement: ' + path)));
              });
          }
        }

        const images = ['one', 'two'];

        const paths = images.map((name) => __variableDynamicURLRuntime0__(\`./assets/images/image-\${name}.svg\`));

        console.log(paths);
      `,
    );

    const appChunk = output.find(({ fileName }) => fileName === 'app.js');
    assert.deepEqual(appChunk.referencedFiles, [
      'assets/image-two-C4stzVZW.svg',
      'assets/image-three-DPeYetg3.svg',
      'assets/image-one-BCCvKrTe.svg',
    ]);

    assert.equal(
      assets['assets/image-one-BCCvKrTe.svg'],
      svg`<svg width="1" height="1"><rect width="1" height="1" fill="red"/></svg>`,
    );
    assert.equal(
      assets['assets/image-two-C4stzVZW.svg'],
      svg`<svg width="1" height="1"><rect width="1" height="1" fill="green"/></svg>`,
    );
    assert.equal(
      assets['assets/image-three-DPeYetg3.svg'],
      svg`<svg width="1" height="1"><rect width="1" height="1" fill="blue"/></svg>`,
    );
  });

  it('ignores patterns that reference a directory', async () => {
    const rootDir = createApp({
      'app.js': js`
        const justUrlObject = new URL('./one.svg', import.meta.url);
        const href = new URL('./two.svg', import.meta.url).href;
        const pathname = new URL('./three.svg', import.meta.url).pathname;
        const searchParams = new URL('./four.svg', import.meta.url).searchParams;

        const directories = [
          new URL('./', import.meta.url),
          new URL('./one', import.meta.url),
          new URL('./one/', import.meta.url),
          new URL('./one/two', import.meta.url),
          new URL('./one/two/', import.meta.url),
        ];

        console.log({
          justUrlObject,
          href,
          pathname,
          searchParams,
          directories,
        });
      `,
      'one.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="red"/></svg>`,
      'two.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="green"/></svg>`,
      'three.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="blue"/></svg>`,
      'four.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="orange"/></svg>`,
      'one/': '', // create directory
      'one/two/': '', // create directory
    });

    const config = {
      input: {
        app: path.join(rootDir, 'app.js'),
      },
      plugins: [importMetaAssets()],
    };

    const build = await rollup(config);
    const { output, chunks, assets } = await generateTestBundle(build, outputConfig);

    assert.equal(Object.keys(chunks).length, 1);
    assert.equal(Object.keys(assets).length, 4);

    assert.equal(
      chunks['app.js'],
      js`
        const justUrlObject = new URL(
          new URL('assets/one-BCCvKrTe.svg', import.meta.url).href
        );
        const href = new URL(new URL('assets/two-C4stzVZW.svg', import.meta.url).href)
          .href;
        const pathname = new URL(
          new URL('assets/three-DPeYetg3.svg', import.meta.url).href
        ).pathname;
        const searchParams = new URL(
          new URL('assets/four-2QgOKKkO.svg', import.meta.url).href
        ).searchParams;

        const directories = [
          new URL('./', import.meta.url),
          new URL('./one', import.meta.url),
          new URL('./one/', import.meta.url),
          new URL('./one/two', import.meta.url),
          new URL('./one/two/', import.meta.url),
        ];

        console.log({
          justUrlObject,
          href,
          pathname,
          searchParams,
          directories,
        });
      `,
    );

    const appChunk = output.find(({ fileName }) => fileName === 'app.js');
    assert.deepEqual(appChunk.referencedFiles, [
      'assets/one-BCCvKrTe.svg',
      'assets/two-C4stzVZW.svg',
      'assets/three-DPeYetg3.svg',
      'assets/four-2QgOKKkO.svg',
    ]);

    assert.equal(
      assets['assets/one-BCCvKrTe.svg'],
      svg`<svg width="1" height="1"><rect width="1" height="1" fill="red"/></svg>`,
    );
    assert.equal(
      assets['assets/two-C4stzVZW.svg'],
      svg`<svg width="1" height="1"><rect width="1" height="1" fill="green"/></svg>`,
    );
    assert.equal(
      assets['assets/three-DPeYetg3.svg'],
      svg`<svg width="1" height="1"><rect width="1" height="1" fill="blue"/></svg>`,
    );
    assert.equal(
      assets['assets/four-2QgOKKkO.svg'],
      svg`<svg width="1" height="1"><rect width="1" height="1" fill="orange"/></svg>`,
    );
  });

  describe('preserveDynamicStructure', () => {
    it('allows dynamic vars with a concatenated file name with a preserved output path', async () => {
      const rootDir = createApp({
        // actual names don't matter, we glob and include everything always
        'app.js': js`
          const images = ['one', 'two'];

          const paths = images.map((name) =>
            new URL(\`./assets/images/image-\${name}.svg\`, import.meta.url),
          );

          console.log(paths);
        `,
        'assets/images/image-one.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="red"/></svg>`,
        'assets/images/image-two.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="green"/></svg>`,
        'assets/images/image-three.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="blue"/></svg>`,
      });

      const config = {
        input: { app: path.join(rootDir, 'app.js') },
        plugins: [importMetaAssets({ preserveDynamicStructure: true })],
      };

      const build = await rollup(config);
      const { output, chunks, assets } = await generateTestBundle(build, {
        ...outputConfig,
        assetFileNames: asset =>
          path.relative(rootDir, asset.originalFileNames[0]).split(path.sep).join('/'),
      });

      assert.equal(Object.keys(chunks).length, 1);
      assert.equal(Object.keys(assets).length, 3);

      assert.equal(
        chunks['app.js'],
        js`
          const images = ['one', 'two'];

          const paths = images.map((name) =>
            new URL(\`./image-\${name}.svg\`, new URL('assets/images/image-one.svg', import.meta.url).href),
          );

          console.log(paths);
        `,
      );

      const appChunk = output.find(({ fileName }) => fileName === 'app.js');
      assert.deepEqual(appChunk.referencedFiles, ['assets/images/image-one.svg']);

      assert.equal(
        assets['assets/images/image-one.svg'],
        svg`<svg width="1" height="1"><rect width="1" height="1" fill="red"/></svg>`,
      );
      assert.equal(
        assets['assets/images/image-two.svg'],
        svg`<svg width="1" height="1"><rect width="1" height="1" fill="green"/></svg>`,
      );
      assert.equal(
        assets['assets/images/image-three.svg'],
        svg`<svg width="1" height="1"><rect width="1" height="1" fill="blue"/></svg>`,
      );
    });

    it('allows dynamic vars in deep paths with a preserved output path', async () => {
      const rootDir = createApp({
        // actual names don't matter, we glob and include everything always
        'app.js': js`
          const images = {
            'category-name': ['image-name'],
          };

          const paths = Object.entries(images).flatMap(([category, names]) =>
            names.map((name) =>
              new URL(\`./assets/images/\${category}/\${name}.svg\`, import.meta.url),
            ),
          );

          console.log(paths);
        `,
        'assets/images/category-one/image-one.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="red"/></svg>`,
        'assets/images/category-one/image-two.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="green"/></svg>`,
        'assets/images/category-two/image-three.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="blue"/></svg>`,
        'assets/images/category-two/image-four.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="orange"/></svg>`,
      });

      const config = {
        input: { app: path.join(rootDir, 'app.js') },
        plugins: [importMetaAssets({ preserveDynamicStructure: true })],
      };

      const build = await rollup(config);
      const { output, chunks, assets } = await generateTestBundle(build, {
        ...outputConfig,
        assetFileNames: asset =>
          path.relative(rootDir, asset.originalFileNames[0]).split(path.sep).join('/'),
      });

      assert.equal(Object.keys(chunks).length, 1);
      assert.equal(Object.keys(assets).length, 4);

      assert.equal(
        chunks['app.js'],
        js`
          const images = {
            'category-name': ['image-name'],
          };

          const paths = Object.entries(images).flatMap(([category, names]) =>
            names.map((name) =>
              new URL(\`../\${category}/\${name}.svg\`, new URL('assets/images/category-one/image-one.svg', import.meta.url).href),
            ),
          );

          console.log(paths);
        `,
      );

      const appChunk = output.find(({ fileName }) => fileName === 'app.js');
      assert.deepEqual(appChunk.referencedFiles, ['assets/images/category-one/image-one.svg']);

      assert.equal(
        assets['assets/images/category-one/image-one.svg'],
        svg`<svg width="1" height="1"><rect width="1" height="1" fill="red"/></svg>`,
      );
      assert.equal(
        assets['assets/images/category-one/image-two.svg'],
        svg`<svg width="1" height="1"><rect width="1" height="1" fill="green"/></svg>`,
      );
      assert.equal(
        assets['assets/images/category-two/image-three.svg'],
        svg`<svg width="1" height="1"><rect width="1" height="1" fill="blue"/></svg>`,
      );
      assert.equal(
        assets['assets/images/category-two/image-four.svg'],
        svg`<svg width="1" height="1"><rect width="1" height="1" fill="orange"/></svg>`,
      );
    });

    it('allows dynamic vars in deep paths with a static path in the middle with a preserved output path', async () => {
      const rootDir = createApp({
        // actual names don't matter, we glob and include everything always
        'app.js': js`
          const images = {
            'category-name': ['image-name'],
          };

          const paths = Object.entries(images).flatMap(([category, names]) =>
            names.map((name) =>
              new URL(\`./assets/images/\${category}/static/\${name}.svg\`, import.meta.url),
            ),
          );

          console.log(paths);
        `,
        'assets/images/category-one/static/image-one.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="red"/></svg>`,
        'assets/images/category-one/static/image-two.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="green"/></svg>`,
        'assets/images/category-two/static/image-three.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="blue"/></svg>`,
        'assets/images/category-two/static/image-four.svg': svg`<svg width="1" height="1"><rect width="1" height="1" fill="orange"/></svg>`,
      });

      const config = {
        input: { app: path.join(rootDir, 'app.js') },
        plugins: [importMetaAssets({ preserveDynamicStructure: true })],
      };

      const build = await rollup(config);
      const { output, chunks, assets } = await generateTestBundle(build, {
        ...outputConfig,
        assetFileNames: asset =>
          path.relative(rootDir, asset.originalFileNames[0]).split(path.sep).join('/'),
      });

      assert.equal(Object.keys(chunks).length, 1);
      assert.equal(Object.keys(assets).length, 4);

      assert.equal(
        chunks['app.js'],
        js`
          const images = {
            'category-name': ['image-name'],
          };

          const paths = Object.entries(images).flatMap(([category, names]) =>
            names.map((name) =>
              new URL(\`../../\${category}/static/\${name}.svg\`, new URL('assets/images/category-one/static/image-one.svg', import.meta.url).href),
            ),
          );

          console.log(paths);
        `,
      );

      const appChunk = output.find(({ fileName }) => fileName === 'app.js');
      assert.deepEqual(appChunk.referencedFiles, [
        'assets/images/category-one/static/image-one.svg',
      ]);

      assert.equal(
        assets['assets/images/category-one/static/image-one.svg'],
        svg`<svg width="1" height="1"><rect width="1" height="1" fill="red"/></svg>`,
      );
      assert.equal(
        assets['assets/images/category-one/static/image-two.svg'],
        svg`<svg width="1" height="1"><rect width="1" height="1" fill="green"/></svg>`,
      );
      assert.equal(
        assets['assets/images/category-two/static/image-three.svg'],
        svg`<svg width="1" height="1"><rect width="1" height="1" fill="blue"/></svg>`,
      );
      assert.equal(
        assets['assets/images/category-two/static/image-four.svg'],
        svg`<svg width="1" height="1"><rect width="1" height="1" fill="orange"/></svg>`,
      );
    });
  });
});
