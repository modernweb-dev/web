import { expect } from 'chai';
import { createPolyfillsLoaderConfig } from '../../src/createPolyfillsLoaderConfig.js';

describe('createPolyfillsLoaderConfig()', () => {
  it('creates a config for a single module build', () => {
    const pluginConfig = {};
    const bundle = {
      options: { format: 'es' },
      entrypoints: [{ importPath: 'app.js', attributes: [] }],
    };

    // @ts-ignore
    const config = createPolyfillsLoaderConfig(pluginConfig, bundle);

    expect(config).to.eql({
      legacy: undefined,
      modern: { files: [{ path: 'app.js', type: 'module', attributes: [] }] },
      polyfills: undefined,
      externalLoaderScript: undefined,
    });
  });

  it('creates a config for multiple entrypoints', () => {
    const pluginConfig = {};
    const bundle = {
      options: { format: 'es' },
      entrypoints: [
        { importPath: 'app-1.js', attributes: [] },
        { importPath: 'app-2.js', attributes: [] },
      ],
    };

    // @ts-ignore
    const config = createPolyfillsLoaderConfig(pluginConfig, bundle);

    expect(config).to.eql({
      legacy: undefined,
      modern: {
        files: [
          { path: 'app-1.js', type: 'module', attributes: [] },
          { path: 'app-2.js', type: 'module', attributes: [] },
        ],
      },
      polyfills: undefined,
      externalLoaderScript: undefined,
    });
  });

  it('creates a config for a single systemjs build', () => {
    const pluginConfig = {};
    const bundle = {
      options: { format: 'system' },
      entrypoints: [
        // @ts-ignore
        { importPath: 'app.js', attributes: [] },
      ],
    };

    // @ts-ignore
    const config = createPolyfillsLoaderConfig(pluginConfig, bundle);

    expect(config).to.eql({
      legacy: undefined,
      modern: { files: [{ path: 'app.js', type: 'systemjs', attributes: [] }] },
      polyfills: undefined,
      externalLoaderScript: undefined,
    });
  });

  it('creates a config for 2 build outputs', () => {
    const pluginConfig = {
      modernOutput: { name: 'modern' },
      legacyOutput: { name: 'legacy', test: "!('noModule' in HTMScriptElement.prototype)" },
    };
    const bundles = {
      modern: {
        options: { format: 'es' },
        entrypoints: [{ importPath: 'app.js', attributes: [] }],
      },
      legacy: {
        options: { format: 'system' },
        entrypoints: [{ importPath: 'legacy/app.js', attributes: [] }],
      },
    };

    // @ts-ignore
    const config = createPolyfillsLoaderConfig(pluginConfig, undefined, bundles);

    expect(config).to.eql({
      modern: { files: [{ path: 'app.js', type: 'module', attributes: [] }] },
      legacy: [
        {
          files: [{ path: 'legacy/app.js', type: 'systemjs', attributes: [] }],
          test: "!('noModule' in HTMScriptElement.prototype)",
        },
      ],
      polyfills: undefined,
      externalLoaderScript: undefined,
    });
  });

  it('creates a config for 3 build outputs', () => {
    const pluginConfig = {
      modernOutput: { name: 'modern' },
      legacyOutput: [
        { name: 'super-legacy', test: 'window.bar' },
        { name: 'legacy', test: 'window.foo' },
      ],
    };
    const bundles = {
      modern: {
        options: { format: 'es' },
        entrypoints: [{ importPath: 'app.js', attributes: [] }],
      },
      legacy: {
        options: { format: 'system' },
        entrypoints: [{ importPath: 'legacy/app.js', attributes: [] }],
      },
      'super-legacy': {
        options: { format: 'system' },
        entrypoints: [{ importPath: 'super-legacy/app.js', attributes: [] }],
      },
    };

    // @ts-ignore
    const config = createPolyfillsLoaderConfig(pluginConfig, undefined, bundles);

    expect(config).to.eql({
      modern: { files: [{ path: 'app.js', type: 'module', attributes: [] }] },
      legacy: [
        {
          files: [{ path: 'super-legacy/app.js', type: 'systemjs', attributes: [] }],
          test: 'window.bar',
        },
        {
          files: [{ path: 'legacy/app.js', type: 'systemjs', attributes: [] }],
          test: 'window.foo',
        },
      ],
      polyfills: undefined,
      externalLoaderScript: undefined,
    });
  });

  it('creates set the file type', () => {
    const pluginConfig = {
      modernOutput: { name: 'modern', type: 'script' },
      legacyOutput: {
        name: 'legacy',
        type: 'script',
        test: "!('noModule' in HTMScriptElement.prototype)",
      },
    };
    const bundles = {
      modern: {
        options: { format: 'es' },
        entrypoints: [{ importPath: 'app.js', attributes: [] }],
      },
      legacy: {
        options: { format: 'system' },
        entrypoints: [{ importPath: 'legacy/app.js', attributes: [] }],
      },
    };

    // @ts-ignore
    const config = createPolyfillsLoaderConfig(pluginConfig, undefined, bundles);

    expect(config).to.eql({
      modern: { files: [{ path: 'app.js', type: 'script', attributes: [] }] },
      legacy: [
        {
          files: [{ path: 'legacy/app.js', type: 'script', attributes: [] }],
          test: "!('noModule' in HTMScriptElement.prototype)",
        },
      ],
      polyfills: undefined,
      externalLoaderScript: undefined,
    });
  });

  it('can set polyfills to load', () => {
    const pluginConfig = {
      polyfills: { fetch: true, webcomponents: true },
    };
    const bundle = {
      options: { format: 'es' },
      entrypoints: [{ importPath: 'app.js', attributes: [] }],
    };

    // @ts-ignore
    const config = createPolyfillsLoaderConfig(pluginConfig, bundle);

    expect(config).to.eql({
      legacy: undefined,
      modern: { files: [{ path: 'app.js', type: 'module', attributes: [] }] },
      polyfills: { fetch: true, webcomponents: true },
      externalLoaderScript: undefined,
    });
  });

  it('throws when a single build is output while multiple builds are configured', () => {
    const pluginConfig = {
      modernOutput: 'modern',
      legacyOutput: 'legacy',
    };
    const bundle = {
      options: { format: 'es' },
      entrypoints: [{ importPath: 'app.js', attributes: [] }],
    };

    // @ts-ignore
    const action = () => createPolyfillsLoaderConfig(pluginConfig, bundle);
    expect(action).to.throw();
  });

  it('throws when a multiple builds are output while no builds are configured', () => {
    const pluginConfig = {};
    const bundles = {
      modern: {
        options: { format: 'es' },
        entrypoints: [{ importPath: 'app.js', attributes: [] }],
      },
      legacy: {
        options: { format: 'system' },
        entrypoints: [{ importPath: 'legacy/app.js', attributes: [] }],
      },
    };

    // @ts-ignore
    const action = () => createPolyfillsLoaderConfig(pluginConfig, undefined, bundles);
    expect(action).to.throw();
  });

  it('throws when the modern build could not be found', () => {
    const pluginConfig = {
      modernOutput: 'not-modern',
      legacyOutput: { name: 'legacy', test: 'window.foo' },
    };
    const bundles = {
      modern: {
        options: { format: 'es' },
        entrypoints: [{ importPath: 'app.js', attributes: [] }],
      },
      legacy: {
        options: { format: 'system' },
        entrypoints: [{ importPath: 'legacy/app.js', attributes: [] }],
      },
    };

    // @ts-ignore
    const action = () => createPolyfillsLoaderConfig(pluginConfig, undefined, bundles);
    expect(action).to.throw();
  });
});
