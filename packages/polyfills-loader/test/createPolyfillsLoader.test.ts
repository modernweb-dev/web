import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { PolyfillsLoaderConfig } from '../src/types.js';
import { createPolyfillsLoader } from '../src/createPolyfillsLoader.js';
import { noModuleSupportTest, fileTypes } from '../src/utils.js';

const updateSnapshots = process.argv.includes('--update-snapshots');

interface TestSnapshotArgs {
  name: string;
  config: PolyfillsLoaderConfig;
  expectedFiles?: string[];
}

async function testSnapshot({ name, config, expectedFiles = [] }: TestSnapshotArgs) {
  const snapshotPath = path.join(__dirname, 'snapshots', 'createPolyfillsLoader', `${name}.js`);
  const loader = await createPolyfillsLoader(config);
  if (!loader) {
    throw new Error('No loader was generated');
  }

  expect(loader.polyfillFiles.map(f => f.path)).to.eql(expectedFiles);

  if (updateSnapshots) {
    fs.writeFileSync(snapshotPath, loader.code, 'utf-8');
  } else {
    const snapshot = fs.readFileSync(snapshotPath, 'utf-8');
    expect(loader.code.trim()).to.equal(snapshot.trim());
  }
}

describe('createPolyfillsLoader', function describe() {
  // bootup of the first test can take a long time in CI to load all the polyfills
  this.timeout(5000);

  it('generates a loader script with one module resource', async () => {
    await testSnapshot({
      name: 'module-resource',
      config: {
        modern: { files: [{ type: fileTypes.MODULE, path: 'app.js' }] },
        polyfills: {
          hash: false,
          fetch: true,
        },
      },
      expectedFiles: ['polyfills/fetch.js'],
    });
  });

  it('generates a loader script with one system resource', async () => {
    await testSnapshot({
      name: 'system-resource',
      config: {
        modern: { files: [{ type: fileTypes.SYSTEMJS, path: 'app.js' }] },
        polyfills: {
          hash: false,
          fetch: true,
        },
      },
      expectedFiles: ['polyfills/fetch.js', 'polyfills/systemjs.js'],
    });
  });

  it('generates a loader script with one module-shim resource', async () => {
    await testSnapshot({
      name: 'module-shim-resource',
      config: {
        modern: { files: [{ type: fileTypes.MODULESHIM, path: 'chunk.js' }] },
        polyfills: {
          hash: false,
          fetch: true,
        },
      },
      expectedFiles: ['polyfills/fetch.js'],
    });
  });

  it('generates a loader script with one script resource', async () => {
    await testSnapshot({
      name: 'script-resource',
      config: {
        modern: { files: [{ type: fileTypes.SCRIPT, path: 'app.js' }] },
        polyfills: {
          hash: false,
          fetch: true,
        },
      },
      expectedFiles: ['polyfills/fetch.js'],
    });
  });

  it('generates a loader script with multiple resources', async () => {
    await testSnapshot({
      name: 'module-resources',
      config: {
        modern: {
          files: [
            { type: fileTypes.MODULE, path: 'app.js' },
            { type: fileTypes.SCRIPT, path: 'shared.js' },
            { type: fileTypes.SYSTEMJS, path: 'other.js' },
          ],
        },
        polyfills: {
          hash: false,
          fetch: true,
        },
      },
      expectedFiles: ['polyfills/fetch.js', 'polyfills/systemjs.js'],
    });
  });

  it('generates a loader script with legacy resources', async () => {
    await testSnapshot({
      name: 'module-legacy-system',
      config: {
        modern: { files: [{ type: fileTypes.MODULE, path: 'app.js' }] },
        legacy: [
          {
            test: noModuleSupportTest,
            files: [{ type: fileTypes.SYSTEMJS, path: 'legacy/app.js' }],
          },
        ],
        polyfills: {
          hash: false,
          fetch: true,
        },
      },
      expectedFiles: ['polyfills/fetch.js', 'polyfills/systemjs.js'],
    });
  });

  it('generates a loader script with multiple legacy resources', async () => {
    await testSnapshot({
      name: 'module-legacy-system-multiple',
      config: {
        modern: {
          files: [
            { type: fileTypes.MODULE, path: 'app-1.js' },
            { type: fileTypes.MODULE, path: 'app-2.js' },
          ],
        },
        legacy: [
          {
            test: noModuleSupportTest,
            files: [
              { type: fileTypes.SYSTEMJS, path: 'legacy/app-1.js' },
              { type: fileTypes.SYSTEMJS, path: 'legacy/app-2.js' },
            ],
          },
        ],
        polyfills: {
          hash: false,
          fetch: true,
        },
      },
      expectedFiles: ['polyfills/fetch.js', 'polyfills/systemjs.js'],
    });
  });

  it('generates a loader script with multiple types of legacy resources', async () => {
    await testSnapshot({
      name: 'multiple-legacy',
      config: {
        modern: {
          files: [
            { type: fileTypes.MODULE, path: 'app-1.js' },
            { type: fileTypes.SCRIPT, path: 'app-2.js' },
          ],
        },
        legacy: [
          {
            test: noModuleSupportTest,
            files: [
              { type: fileTypes.SYSTEMJS, path: 'legacy/app-1.js' },
              { type: fileTypes.SCRIPT, path: 'legacy/app-2.js' },
            ],
          },
          {
            test: "'foo' in bar",
            files: [
              { type: fileTypes.SCRIPT, path: 'foobar/app-1.js' },
              { type: fileTypes.SYSTEMJS, path: 'foobar/app-2.js' },
            ],
          },
        ],
        polyfills: {
          hash: false,
          fetch: true,
        },
      },
      expectedFiles: ['polyfills/fetch.js', 'polyfills/systemjs.js'],
    });
  });

  it('generates a loader script with multiple polyfills', async () => {
    await testSnapshot({
      name: 'polyfills',
      config: {
        modern: { files: [{ type: fileTypes.MODULE, path: 'app.js' }] },
        polyfills: {
          hash: false,
          coreJs: true,
          webcomponents: true,
          fetch: true,
        },
      },
      expectedFiles: [
        'polyfills/fetch.js',
        'polyfills/webcomponents.js',
        'polyfills/custom-elements-es5-adapter.js',
        'polyfills/core-js.js',
      ],
    });
  });

  it('generates a loader script with customized polyfills directory', async () => {
    await testSnapshot({
      name: 'custom-polyfills-dir',
      config: {
        modern: { files: [{ type: fileTypes.MODULE, path: 'app.js' }] },
        polyfillsDir: 'foo/bar',
        polyfills: {
          hash: false,
          coreJs: true,
          webcomponents: true,
          fetch: true,
        },
      },
      expectedFiles: [
        'foo/bar/fetch.js',
        'foo/bar/webcomponents.js',
        'foo/bar/custom-elements-es5-adapter.js',
        'foo/bar/core-js.js',
      ],
    });
  });

  it('generates a loader script with a relative path to polyfills directory', async () => {
    await testSnapshot({
      name: 'relative-polyfills-dir',
      config: {
        modern: { files: [{ type: fileTypes.MODULE, path: 'app.js' }] },
        relativePathToPolyfills: '../..',
        polyfills: {
          hash: false,
          coreJs: true,
          webcomponents: true,
          fetch: true,
        },
      },
      expectedFiles: [
        'polyfills/fetch.js',
        'polyfills/webcomponents.js',
        'polyfills/custom-elements-es5-adapter.js',
        'polyfills/core-js.js',
      ],
    });
  });

  it('generates a loader script with a polyfill with an initializer', async () => {
    await testSnapshot({
      name: 'polyfills-initializer',
      config: {
        modern: { files: [{ type: fileTypes.MODULE, path: 'app.js' }] },
        polyfills: {
          hash: false,
          coreJs: true,
          dynamicImport: true,
        },
      },
      expectedFiles: ['polyfills/dynamic-import.js', 'polyfills/core-js.js'],
    });
  });

  it('generates a loader script with a polyfill loaded as a module', async () => {
    await testSnapshot({
      name: 'polyfills-module',
      config: {
        modern: { files: [{ type: fileTypes.MODULE, path: 'app.js' }] },
        polyfills: {
          hash: false,
          coreJs: true,
        },
      },
      expectedFiles: ['polyfills/core-js.js'],
    });
  });

  it('generates a loader script with upwards file path', async () => {
    await testSnapshot({
      name: 'upwards-file-path',
      config: {
        modern: { files: [{ type: fileTypes.MODULE, path: '../app.js' }] },
        polyfills: {
          hash: false,
          fetch: true,
        },
      },
      expectedFiles: ['polyfills/fetch.js'],
    });
  });

  it('generates a loader script with an absolute file path', async () => {
    await testSnapshot({
      name: 'absolute-file-path',
      config: {
        modern: { files: [{ type: fileTypes.MODULE, path: '/app.js' }] },
        polyfills: {
          hash: false,
          fetch: true,
        },
      },
      expectedFiles: ['polyfills/fetch.js'],
    });
  });

  it('can generate a minified loader', async () => {
    await testSnapshot({
      name: 'minified',
      config: {
        modern: { files: [{ type: fileTypes.MODULE, path: '/app.js' }] },
        minify: true,
        polyfills: {
          hash: false,
          fetch: true,
        },
      },
      expectedFiles: ['polyfills/fetch.js'],
    });
  });

  it('can generate a loader without polyfills or legacy', async () => {
    await testSnapshot({
      name: 'no-polyfills-no-legacy',
      config: {
        modern: { files: [{ type: fileTypes.MODULE, path: '/app.js' }] },
        minify: false,
      },
      expectedFiles: [],
    });
  });
});
