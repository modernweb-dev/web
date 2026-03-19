import { expect } from 'chai';
import path from 'path';
import fs from 'fs';
import { injectPolyfillsLoader } from '../src/injectPolyfillsLoader.js';
import { noModuleSupportTest, fileTypes } from '../src/utils.js';
import { PolyfillsLoaderConfig } from '../src/types.js';

const updateSnapshots = process.argv.includes('--update-snapshots');

const defaultConfig = {
  modern: { files: [{ type: fileTypes.MODULE, path: 'app.js' }] },
  polyfills: {
    hash: false,
  },
};

async function testSnapshot(name: string, htmlString: string, config: PolyfillsLoaderConfig) {
  const snapshotPath = path.join(__dirname, 'snapshots', 'injectPolyfillsLoader', `${name}.html`);
  const result = await injectPolyfillsLoader(htmlString, config);

  if (updateSnapshots) {
    fs.writeFileSync(snapshotPath, result.htmlString, 'utf-8');
  } else {
    const snapshot = fs.readFileSync(snapshotPath, 'utf-8');
    expect(result.htmlString.trim()).to.equal(snapshot.trim());
  }
}

describe('injectPolyfillsLoader', () => {
  it('injects a polyfills loader script', async () => {
    const html = `
      <html>
      <head></head>

      <body>
        <div>Hello world</div>
      </body>
      </html>
    `;

    await await testSnapshot('no-polyfills-no-legacy', html, defaultConfig);
  });

  it('injects a loader with module and polyfills', async () => {
    const html = `
      <div>before</div>
      <script type="module" src="./app.js"></script>
      <div>after</div>
    `;

    await testSnapshot('module-and-polyfills', html, {
      ...defaultConfig,
      polyfills: {
        hash: false,
        webcomponents: true,
        fetch: true,
        intersectionObserver: true,
      },
    });
  });

  it('injects a loader with module and legacy', async () => {
    const html = `
      <div>before</div>
      <script type="module" src="./app.js"></script>
      <div>after</div>
    `;

    await testSnapshot('module-and-legacy', html, {
      ...defaultConfig,
      legacy: [
        {
          test: noModuleSupportTest,
          files: [
            {
              path: 'a.js',
              type: fileTypes.SYSTEMJS,
            },
            {
              path: 'b.js',
              type: fileTypes.SYSTEMJS,
            },
          ],
        },
      ],
    });
  });

  it('injects a loader with module, legacy and polyfills', async () => {
    const html = `
      <div>before</div>
      <script type="module" src="./app.js"></script>
      <div>after</div>
    `;

    await testSnapshot('module-polyfills-and-legacy', html, {
      ...defaultConfig,
      legacy: [
        {
          test: noModuleSupportTest,
          files: [
            {
              path: 'a.js',
              type: fileTypes.SYSTEMJS,
            },
            {
              path: 'b.js',
              type: fileTypes.SYSTEMJS,
            },
          ],
        },
      ],
      polyfills: {
        hash: false,
        fetch: true,
        intersectionObserver: true,
      },
    });
  });

  it('injects a loader with multiple legacy', async () => {
    const html = `
      <div>before</div>
      <script type="module" src="./app.js"></script>
      <div>after</div>
    `;

    await testSnapshot('multiple-legacy', html, {
      ...defaultConfig,
      legacy: [
        {
          test: "'foo' in bar",
          files: [
            {
              path: 'a.js',
              type: fileTypes.MODULE,
            },
            {
              path: 'b.js',
              type: fileTypes.MODULE,
            },
          ],
        },
        {
          test: 'window.x',
          files: [
            {
              path: 'a.js',
              type: fileTypes.SYSTEMJS,
            },
            {
              path: 'b.js',
              type: fileTypes.SYSTEMJS,
            },
          ],
        },
      ],
    });
  });

  it('does not polyfill import maps', async () => {
    const html = `
      <head>
        <script type="importmap">{ "imports": { "foo": "bar" } }</script>
      </head>
      <div>before</div>
      <script type="module" src="./module-a.js"></script>
      <div>after</div>
    `;

    await testSnapshot('no-importmap-polyfill', html, defaultConfig);
  });

  it('polyfills importmaps when main module type is systemjs', async () => {
    const html = `
      <head>
        <script type="importmap">{ "imports": { "foo": "bar" } }</script>
      </head>
      <div>before</div>
      <script type="module" src="./module-a.js"></script>
      <div>after</div>
    `;

    await testSnapshot('systemjs-polyfill-importmap-modern', html, {
      ...defaultConfig,
      legacy: [
        {
          test: noModuleSupportTest,
          files: [
            {
              path: 'a.js',
              type: fileTypes.SYSTEMJS,
            },
            {
              path: 'b.js',
              type: fileTypes.SYSTEMJS,
            },
          ],
        },
      ],
    });
  });

  it('polyfills importmaps when legacy is systemjs', async () => {
    const html = `
      <head>
        <script type="importmap">{ "imports": { "foo": "bar" } }</script>
      </head>
      <div>before</div>
      <script type="module" src="./module-a.js"></script>
      <div>after</div>
    `;

    await testSnapshot('systemjs-polyfill-importmap-legacy', html, {
      ...defaultConfig,
      legacy: [
        {
          test: noModuleSupportTest,
          files: [
            {
              path: 'a.js',
              type: fileTypes.SYSTEMJS,
            },
            {
              path: 'b.js',
              type: fileTypes.SYSTEMJS,
            },
          ],
        },
      ],
    });
  });

  it('can injects a loader externally', async () => {
    const html = `
      <div>before</div>
      <script type="module" src="./app.js"></script>
      <div>after</div>
    `;

    await testSnapshot('external-loader', html, {
      ...defaultConfig,
      polyfills: {
        hash: false,
        webcomponents: true,
        fetch: true,
        intersectionObserver: true,
      },
      externalLoaderScript: true,
    });
  });
});
