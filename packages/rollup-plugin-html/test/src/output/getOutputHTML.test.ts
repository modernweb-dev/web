import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import path from 'path';
import { html } from '../../../../../test-helpers/node-test-helpers.js';
import type { EntrypointBundle } from '../../../dist/RollupPluginHTMLOptions.js';
import type { GetOutputHTMLParams } from '../../../dist/output/getOutputHTML.js';
import { getOutputHTML } from '../../../dist/output/getOutputHTML.js';

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
    emittedAssets: { static: new Map(), hashed: new Map(), assetsInCssByHash: {} },
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
    assert.equal(
      html`${output}`,
      html`
        <html>
          <head></head>
          <body>
            <h1>Input HTML</h1>
            <script type="module" src="/app.js"></script>
            <script type="module" src="/module.js"></script>
          </body>
        </html>
      `,
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
    assert.equal(
      html`${output}`,
      html`
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
      `,
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

    assert.equal(
      html`${output}`,
      html`
        <html>
          <head></head>
          <body>
            <h1>Transformed Input HTML</h1>
            <script type="module" src="/app.js"></script>
            <script type="module" src="/module.js"></script>
          </body>
        </html>
      `,
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

    assert.equal(
      html`${output}`,
      html`
        <html>
          <head></head>
          <body>
            <h2>Transformed Input HTML</h2>
            <script type="module" src="/app.js"></script>
            <script type="module" src="/module.js"></script>
          </body>
        </html>
      `,
    );
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

    assert.equal(
      html`${output}`,
      html`
        <html>
          <head></head>
          <body>
            <h2>Transformed Input HTML</h2>
            <script type="module" src="/app.js"></script>
            <script type="module" src="/module.js"></script>
          </body>
        </html>
      `,
    );
  });

  it('can disable default injection', async () => {
    const output = await getOutputHTML({
      ...defaultOptions,
      defaultInjectDisabled: true,
    });

    assert.equal(
      html`${output}`,
      html`
        <html>
          <head></head>
          <body>
            <h1>Input HTML</h1>
          </body>
        </html>
      `,
    );
  });

  it('can converts absolute urls to full absolute urls', async () => {
    const rootDir = path.resolve(import.meta.dirname, '..', '..', 'fixtures', 'assets');
    const hashed = new Map<string, string>();
    hashed.set(path.join(rootDir, 'image-social.png'), 'image-social-xxx.png');

    const output = await getOutputHTML({
      ...defaultOptions,
      defaultInjectDisabled: true,
      pluginOptions: {
        absoluteBaseUrl: 'http://test.com',
        rootDir,
      },
      emittedAssets: { static: new Map(), hashed, assetsInCssByHash: {} },
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

    assert.equal(
      html`${output}`,
      html`
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
      `,
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

    assert.equal(
      output,
      '<html><head></head><body><script>console.log("x")</script><script type="module" src="/app.js"></script><script type="module" src="/module.js"></script></body></html>',
    );
  });
});
