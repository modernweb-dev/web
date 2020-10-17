import { expect } from 'chai';
import { getOutputHTML } from '../../../src/output/getOutputHTML';
import { EntrypointBundle } from '../../../src/RollupPluginHTMLOptions';

describe('getOutputHTML()', () => {
  const defaultEntrypointBundles: Record<string, EntrypointBundle> = {
    default: {
      name: 'default',
      options: { format: 'es' },
      // @ts-ignore
      entrypoints: [{ importPath: '/app.js' }, { importPath: '/module.js' }],
    },
  };

  const defaultOptions = {
    pluginOptions: {},
    entrypointBundles: defaultEntrypointBundles,
    input: {
      html: '<h1>Input HTML</h1>',
      name: 'index.html',
      moduleImports: [],
      inlineModules: new Map(),
    },
  };

  it('injects output int the input HTML', async () => {
    const output = await getOutputHTML(defaultOptions);
    expect(output).to.equal(
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
    expect(output).to.equal(
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
        transform: html => html.replace('Input HTML', 'Transformed Input HTML'),
      },
    });

    expect(output).to.equal(
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
        transform: [
          html => html.replace('Input HTML', 'Transformed Input HTML'),
          html => html.replace(/h1/g, 'h2'),
        ],
      },
    });

    expect(output).to.equal(
      '<html><head></head><body><h2>Transformed Input HTML</h2>' +
        '<script type="module" src="/app.js"></script>' +
        '<script type="module" src="/module.js"></script>' +
        '</body></html>',
    );
  });

  it('can set transform functions provided by other plugins', async () => {
    const output = await getOutputHTML({
      ...defaultOptions,
      externalTransformFns: [html => html.replace('Input HTML', 'Transformed Input HTML')],
    });

    expect(output).to.equal(
      '<html><head></head><body><h1>Transformed Input HTML</h1>' +
        '<script type="module" src="/app.js"></script>' +
        '<script type="module" src="/module.js"></script>' +
        '</body></html>',
    );
  });

  it('can combine external and regular transform functions', async () => {
    const output = await getOutputHTML({
      ...defaultOptions,
      pluginOptions: {
        ...defaultOptions.pluginOptions,
        transform: html => html.replace('Input HTML', 'Transformed Input HTML'),
      },
      externalTransformFns: [html => html.replace(/h1/g, 'h2')],
    });

    expect(output).to.equal(
      '<html><head></head><body><h2>Transformed Input HTML</h2>' +
        '<script type="module" src="/app.js"></script>' +
        '<script type="module" src="/module.js"></script>' +
        '</body></html>',
    );
  });
});
