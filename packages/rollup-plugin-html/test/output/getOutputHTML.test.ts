<<<<<<< HEAD:packages/rollup-plugin-html/test/src/output/getOutputHTML.test.ts
||||||| parent of 9007e014 (chore: migrate tests from mocha/chai to node:test + node:assert):packages/rollup-plugin-html/test/src/output/getOutputHTML.test.ts
import { expect } from 'chai';
import path from 'path';
<<<<<<< HEAD:packages/rollup-plugin-html/test/src/output/getOutputHTML.test.ts
import { getOutputHTML, GetOutputHTMLParams } from '../../../src/output/getOutputHTML.ts';
import { EntrypointBundle } from '../../../src/RollupPluginHTMLOptions.ts';
import { html } from '../../utils.ts';
||||||| parent of c37bb778 (chore: migrate tests from mocha/chai to node:test + node:assert):packages/rollup-plugin-html/test/src/output/getOutputHTML.test.ts
import { getOutputHTML, GetOutputHTMLParams } from '../../../src/output/getOutputHTML.ts';
import { EntrypointBundle } from '../../../src/RollupPluginHTMLOptions.ts';
import { html } from '../../utils.ts';
=======
import type { GetOutputHTMLParams } from '../../src/output/getOutputHTML.ts';
import { getOutputHTML } from '../../src/output/getOutputHTML.ts';
import type { EntrypointBundle } from '../../src/RollupPluginHTMLOptions.ts';

const __dirname = import.meta.dirname;
>>>>>>> c37bb778 (chore: migrate tests from mocha/chai to node:test + node:assert):packages/rollup-plugin-html/test/output/getOutputHTML.test.ts

describe('getOutputHTML()', () => {
  const defaultEntrypointBundles: Record<string, EntrypointBundle> = {
    default: {
      name: 'default',
      options: { format: 'es' },
      // @ts-ignore
      entrypoints: [{ importPath: '/app.js' }, { importPath: '/module.js' }],
    },
  };

  const defaultOptions: GetOutputHTMLParams = {
    pluginOptions: {},
    outputDir: '/',
    emittedAssets: { static: new Map(), hashed: new Map() },
    entrypointBundles: defaultEntrypointBundles,
    input: {
      html: html`<h1>Input HTML</h1>`,
      name: 'index.html',
      moduleImports: [],
      assets: [],
      inlineModules: [],
    },
    defaultInjectDisabled: false,
    injectServiceWorker: false,
    serviceWorkerPath: '',
    strictCSPInlineScripts: false,
  };

  it('injects output into the input HTML', async () => {
    const output = await getOutputHTML(defaultOptions);
    expect(html`${output}`).to.equal(html`
      <html>
        <head></head>
        <body>
          <h1>Input HTML</h1>
          <script type="module" src="/app.js"></script>
          <script type="module" src="/module.js"></script>
        </body>
      </html>
    `);
  });

  it('generates a HTML file for multiple rollup bundles', async () => {
    const entrypointBundles: Record<string, EntrypointBundle> = {
      modern: {
        name: 'modern',
        options: { format: 'es' },
        // @ts-ignore
        entrypoints: [{ importPath: '/app.js' }, { importPath: '/module.js' }],
      },
      legacy: {
        name: 'legacy',
        options: { format: 'system' },
        // @ts-ignore
        entrypoints: [{ importPath: '/legacy/app.js' }, { importPath: '/legacy/module.js' }],
      },
    };

    const output = await getOutputHTML({ ...defaultOptions, entrypointBundles });
    expect(html`${output}`).to.equal(html`
      <html>
        <head></head>
        <body>
          <h1>Input HTML</h1>
          <script type="module" src="/app.js"></script>
          <script type="module" src="/module.js"></script>
          <script>
            System.import('/legacy/app.js');
          </script>
          <script>
            System.import('/legacy/module.js');
          </script>
        </body>
      </html>
    `);
  });

  it('can transform html output', async () => {
    const output = await getOutputHTML({
      ...defaultOptions,
      pluginOptions: {
        ...defaultOptions.pluginOptions,
        transformHtml: html => html.replace('Input HTML', 'Transformed Input HTML'),
      },
    });

    expect(html`${output}`).to.equal(html`
      <html>
        <head></head>
        <body>
          <h1>Transformed Input HTML</h1>
          <script type="module" src="/app.js"></script>
          <script type="module" src="/module.js"></script>
        </body>
      </html>
    `);
  });

  it('allows setting multiple html transform functions', async () => {
    const output = await getOutputHTML({
      ...defaultOptions,
      pluginOptions: {
        ...defaultOptions.pluginOptions,
        transformHtml: [
          html => html.replace('Input HTML', 'Transformed Input HTML'),
          html => html.replace(/h1/g, 'h2'),
        ],
      },
    });

    expect(html`${output}`).to.equal(html`
      <html>
        <head></head>
        <body>
          <h2>Transformed Input HTML</h2>
          <script type="module" src="/app.js"></script>
          <script type="module" src="/module.js"></script>
        </body>
      </html>
    `);
  });

  it('can combine external and regular transform functions', async () => {
    const output = await getOutputHTML({
      ...defaultOptions,
      pluginOptions: {
        ...defaultOptions.pluginOptions,
        transformHtml: html => html.replace('Input HTML', 'Transformed Input HTML'),
      },
      externalTransformHtmlFns: [html => html.replace(/h1/g, 'h2')],
    });

    expect(html`${output}`).to.equal(html`
      <html>
        <head></head>
        <body>
          <h2>Transformed Input HTML</h2>
          <script type="module" src="/app.js"></script>
          <script type="module" src="/module.js"></script>
        </body>
      </html>
    `);
  });

  it('can disable default injection', async () => {
    const output = await getOutputHTML({
      ...defaultOptions,
      defaultInjectDisabled: true,
    });

    expect(html`${output}`).to.equal(html`
      <html>
        <head></head>
        <body>
          <h1>Input HTML</h1>
        </body>
      </html>
    `);
  });

  it('can converts absolute urls to full absolute urls', async () => {
    const rootDir = path.resolve(__dirname, '..', '..', 'fixtures', 'assets');
    const hashed = new Map<string, string>();
    hashed.set(path.join(rootDir, 'image-social.png'), 'image-social-xxx.png');

    const output = await getOutputHTML({
      ...defaultOptions,
      defaultInjectDisabled: true,
      pluginOptions: {
        absoluteBaseUrl: 'http://test.com',
        rootDir,
      },
      emittedAssets: { static: new Map(), hashed },
      input: {
        ...defaultOptions.input,
        html: html`
          <html>
            <head>
              <meta property="og:image" content="/image-social.png" />
              <meta property="og:image" content="http://domain.com/image-social.png" />
              <link rel="canonical" href="/" />
              <link rel="canonical" href="http://domain.com/" />
              <meta property="og:url" content="/" />
            </head>
            <body></body>
          </html>
        `,
        filePath: path.join(rootDir, 'index.html'),
      },
    });

    expect(html`${output}`).to.equal(html`
      <html>
        <head>
          <meta property="og:image" content="http://test.com/image-social-xxx.png" />
          <meta property="og:image" content="http://domain.com/image-social.png" />
          <link rel="canonical" href="http://test.com/" />
          <link rel="canonical" href="http://domain.com/" />
          <meta property="og:url" content="http://test.com/" />
        </head>
        <body></body>
      </html>
    `);
  });

  it('can minify HTML', async () => {
    const htmlInput = `
    
    <html>

      <head></head>
      <body>
        <script>
          (() => {
            const foo = 'x';
            console.log(foo);
          })();

        </script>
      </body>

    </html>
    `;
    const output = await getOutputHTML({
      ...defaultOptions,
      pluginOptions: {
        ...defaultOptions.pluginOptions,
        minify: true,
      },
      input: {
        ...defaultOptions.input,
        html: htmlInput,
      },
    });

    expect(output).to.equal(
      '<html><head></head><body><script>console.log("x")</script><script type="module" src="/app.js"></script><script type="module" src="/module.js"></script></body></html>',
    );
  });
});
=======
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import path from 'path';
<<<<<<< HEAD:packages/rollup-plugin-html/test/src/output/getOutputHTML.test.ts
import { getOutputHTML, GetOutputHTMLParams } from '../../../src/output/getOutputHTML.ts';
import { EntrypointBundle } from '../../../src/RollupPluginHTMLOptions.ts';
import { html } from '../../utils.ts';
||||||| parent of c37bb778 (chore: migrate tests from mocha/chai to node:test + node:assert):packages/rollup-plugin-html/test/src/output/getOutputHTML.test.ts
import { getOutputHTML, GetOutputHTMLParams } from '../../../src/output/getOutputHTML.ts';
import { EntrypointBundle } from '../../../src/RollupPluginHTMLOptions.ts';
import { html } from '../../utils.ts';
=======
import type { GetOutputHTMLParams } from '../../src/output/getOutputHTML.ts';
import { getOutputHTML } from '../../src/output/getOutputHTML.ts';
import type { EntrypointBundle } from '../../src/RollupPluginHTMLOptions.ts';

const __dirname = import.meta.dirname;
>>>>>>> c37bb778 (chore: migrate tests from mocha/chai to node:test + node:assert):packages/rollup-plugin-html/test/output/getOutputHTML.test.ts

describe('getOutputHTML()', () => {
  const defaultEntrypointBundles: Record<string, EntrypointBundle> = {
    default: {
      name: 'default',
      options: { format: 'es' },
      // @ts-ignore
      entrypoints: [{ importPath: '/app.js' }, { importPath: '/module.js' }],
    },
  };

  const defaultOptions: GetOutputHTMLParams = {
    pluginOptions: {},
    outputDir: '/',
    emittedAssets: { static: new Map(), hashed: new Map() },
    entrypointBundles: defaultEntrypointBundles,
    input: {
      html: '<h1>Input HTML</h1>',
      name: 'index.html',
      moduleImports: [],
      assets: [],
      inlineModules: [],
    },
    defaultInjectDisabled: false,
    injectServiceWorker: false,
    serviceWorkerPath: '',
    strictCSPInlineScripts: false,
  };

  it('injects output into the input HTML', async () => {
    const output = await getOutputHTML(defaultOptions);
    assert.strictEqual(output,
      '<html><head></head><body><h1>Input HTML</h1>' +
        '<script type="module" src="/app.js"></script>' +
        '<script type="module" src="/module.js"></script>' +
        '</body></html>',
    );
  });

  it('generates a HTML file for multiple rollup bundles', async () => {
    const entrypointBundles: Record<string, EntrypointBundle> = {
      modern: {
        name: 'modern',
        options: { format: 'es' },
        // @ts-ignore
        entrypoints: [{ importPath: '/app.js' }, { importPath: '/module.js' }],
      },
      legacy: {
        name: 'legacy',
        options: { format: 'system' },
        // @ts-ignore
        entrypoints: [{ importPath: '/legacy/app.js' }, { importPath: '/legacy/module.js' }],
      },
    };

    const output = await getOutputHTML({ ...defaultOptions, entrypointBundles });
    assert.strictEqual(output,
      '<html><head></head><body><h1>Input HTML</h1>' +
        '<script type="module" src="/app.js"></script>' +
        '<script type="module" src="/module.js"></script>' +
        '<script>System.import("/legacy/app.js");</script>' +
        '<script>System.import("/legacy/module.js");</script>' +
        '</body></html>',
    );
  });

  it('can transform html output', async () => {
    const output = await getOutputHTML({
      ...defaultOptions,
      pluginOptions: {
        ...defaultOptions.pluginOptions,
        transformHtml: html => html.replace('Input HTML', 'Transformed Input HTML'),
      },
    });

    assert.strictEqual(output,
      '<html><head></head><body><h1>Transformed Input HTML</h1>' +
        '<script type="module" src="/app.js"></script>' +
        '<script type="module" src="/module.js"></script>' +
        '</body></html>',
    );
  });

  it('allows setting multiple html transform functions', async () => {
    const output = await getOutputHTML({
      ...defaultOptions,
      pluginOptions: {
        ...defaultOptions.pluginOptions,
        transformHtml: [
          html => html.replace('Input HTML', 'Transformed Input HTML'),
          html => html.replace(/h1/g, 'h2'),
        ],
      },
    });

    assert.strictEqual(output,
      '<html><head></head><body><h2>Transformed Input HTML</h2>' +
        '<script type="module" src="/app.js"></script>' +
        '<script type="module" src="/module.js"></script>' +
        '</body></html>',
    );
  });

  it('can combine external and regular output transform functions', async () => {
    const output = await getOutputHTML({
      ...defaultOptions,
      pluginOptions: {
        ...defaultOptions.pluginOptions,
        transformHtml: html => html.replace('Input HTML', 'Transformed Input HTML'),
      },
      outputExternalTransformHtmlFns: [html => html.replace(/h1/g, 'h2')],
    });

    assert.strictEqual(output,
      '<html><head></head><body><h2>Transformed Input HTML</h2>' +
        '<script type="module" src="/app.js"></script>' +
        '<script type="module" src="/module.js"></script>' +
        '</body></html>',
    );
  });

  it('can disable default injection', async () => {
    const output = await getOutputHTML({
      ...defaultOptions,
      defaultInjectDisabled: true,
    });

    assert.strictEqual(output, '<html><head></head><body><h1>Input HTML</h1></body></html>');
  });

  it('can converts absolute urls to full absolute urls', async () => {
    const rootDir = path.resolve(__dirname, '..', 'fixtures', 'assets');
    const hashed = new Map<string, string>();
    hashed.set(path.join(rootDir, 'image-social.png'), 'image-social-xxx.png');

    const output = await getOutputHTML({
      ...defaultOptions,
      defaultInjectDisabled: true,
      pluginOptions: {
        absoluteBaseUrl: 'http://test.com',
        rootDir,
      },
      emittedAssets: { static: new Map(), hashed },
      input: {
        ...defaultOptions.input,
        html: [
          '<html><head>',
          '<meta property="og:image" content="/image-social.png">',
          '<meta property="og:image" content="http://domain.com/image-social.png">',
          '<link rel="canonical" href="/">',
          '<link rel="canonical" href="http://domain.com/">',
          '<meta property="og:url" content="/">',
          '</head><body></body></html>',
        ].join('\n'),
        filePath: path.join(rootDir, 'index.html'),
      },
    });

    assert.strictEqual(output,
      [
        '<html><head>',
        '<meta property="og:image" content="http://test.com/image-social-xxx.png">',
        '<meta property="og:image" content="http://domain.com/image-social.png">',
        '<link rel="canonical" href="http://test.com/">',
        '<link rel="canonical" href="http://domain.com/">',
        '<meta property="og:url" content="http://test.com/">',
        '</head><body></body></html>',
      ].join('\n'),
    );
  });

  it('can minify HTML', async () => {
    const htmlInput = `
    
    <html>

      <head></head>
      <body>
        <script>
          (() => {
            const foo = 'x';
            console.log(foo);
          })();

        </script>
      </body>

    </html>
    `;
    const output = await getOutputHTML({
      ...defaultOptions,
      pluginOptions: {
        ...defaultOptions.pluginOptions,
        minify: true,
      },
      input: {
        ...defaultOptions.input,
        html: htmlInput,
      },
    });

    assert.strictEqual(output,
      '<html><head></head><body><script>console.log("x")</script><script type="module" src="/app.js"></script><script type="module" src="/module.js"></script></body></html>',
    );
  });
});
>>>>>>> 9007e014 (chore: migrate tests from mocha/chai to node:test + node:assert):packages/rollup-plugin-html/test/output/getOutputHTML.test.ts
