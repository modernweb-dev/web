import { expect } from 'chai';
import { createPolyfillsLoaderConfig } from '../../src/createPolyfillsLoaderConfig';

describe('createPolyfillsLoaderConfig()', () => {
  it('creates a config for a single module build', () => {
    const pluginConfig = {};
    const bundle = {
      options: { format: 'es' },
      entrypoints: [{ importPath: 'app.js' }],
    };

    // @ts-ignore
    const config = createPolyfillsLoaderConfig(pluginConfig, bundle);

    expect(config).to.eql({
      legacy: undefined,
      modern: { files: [{ path: 'app.js', type: 'module' }] },
      polyfills: undefined,
    });
  });

  it('creates a config for multiple entrypoints', () => {
    const pluginConfig = {};
    const bundle = {
      options: { format: 'es' },
      entrypoints: [{ importPath: 'app-1.js' }, { importPath: 'app-2.js' }],
    };

    // @ts-ignore
    const config = createPolyfillsLoaderConfig(pluginConfig, bundle);

    expect(config).to.eql({
      legacy: undefined,
      modern: {
        files: [
          { path: 'app-1.js', type: 'module' },
          { path: 'app-2.js', type: 'module' },
        ],
      },
      polyfills: undefined,
    });
  });

  it('creates a config for a single systemjs build', () => {
    const pluginConfig = {};
    const bundle = {
      options: { format: 'system' },
      entrypoints: [
        // @ts-ignore
        { importPath: 'app.js' },
      ],
    };

    // @ts-ignore
    const config = createPolyfillsLoaderConfig(pluginConfig, bundle);

    expect(config).to.eql({
      legacy: undefined,
      modern: { files: [{ path: 'app.js', type: 'systemjs' }] },
      polyfills: undefined,
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
        entrypoints: [{ importPath: 'app.js' }],
      },
      legacy: {
        options: { format: 'system' },
        entrypoints: [{ importPath: 'legacy/app.js' }],
      },
    };

    // @ts-ignore
    const config = createPolyfillsLoaderConfig(pluginConfig, undefined, bundles);

    expect(config).to.eql({
      modern: { files: [{ path: 'app.js', type: 'module' }] },
      legacy: [
        {
          files: [{ path: 'legacy/app.js', type: 'systemjs' }],
          test: "!('noModule' in HTMScriptElement.prototype)",
        },
      ],
      polyfills: undefined,
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
        entrypoints: [{ importPath: 'app.js' }],
      },
      legacy: {
        options: { format: 'system' },
        entrypoints: [{ importPath: 'legacy/app.js' }],
      },
      'super-legacy': {
        options: { format: 'system' },
        entrypoints: [{ importPath: 'super-legacy/app.js' }],
      },
    };

    // @ts-ignore
    const config = createPolyfillsLoaderConfig(pluginConfig, undefined, bundles);

    expect(config).to.eql({
      modern: { files: [{ path: 'app.js', type: 'module' }] },
      legacy: [
        {
          files: [{ path: 'super-legacy/app.js', type: 'systemjs' }],
          test: 'window.bar',
        },
        {
          files: [{ path: 'legacy/app.js', type: 'systemjs' }],
          test: 'window.foo',
        },
      ],
      polyfills: undefined,
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
        entrypoints: [{ importPath: 'app.js' }],
      },
      legacy: {
        options: { format: 'system' },
        entrypoints: [{ importPath: 'legacy/app.js' }],
      },
    };

    // @ts-ignore
    const config = createPolyfillsLoaderConfig(pluginConfig, undefined, bundles);

    expect(config).to.eql({
      modern: { files: [{ path: 'app.js', type: 'script' }] },
      legacy: [
        {
          files: [{ path: 'legacy/app.js', type: 'script' }],
          test: "!('noModule' in HTMScriptElement.prototype)",
        },
      ],
      polyfills: undefined,
    });
  });

  it('can set polyfills to load', () => {
    const pluginConfig = {
      polyfills: { fetch: true, webcomponents: true },
    };
    const bundle = {
      options: { format: 'es' },
      entrypoints: [{ importPath: 'app.js' }],
    };

    // @ts-ignore
    const config = createPolyfillsLoaderConfig(pluginConfig, bundle);

    expect(config).to.eql({
      legacy: undefined,
      modern: { files: [{ path: 'app.js', type: 'module' }] },
      polyfills: { fetch: true, webcomponents: true },
    });
  });

  it('throws when a single build is output while multiple builds are configured', () => {
    const pluginConfig = {
      modernOutput: 'modern',
    };
    const bundle = {
      options: { format: 'es' },
      entrypoints: [{ importPath: 'app.js' }],
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
        entrypoints: [{ importPath: 'app.js' }],
      },
      legacy: {
        options: { format: 'system' },
        entrypoints: [{ importPath: 'legacy/app.js' }],
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
        entrypoints: [{ importPath: 'app.js' }],
      },
      legacy: {
        options: { format: 'system' },
        entrypoints: [{ importPath: 'legacy/app.js' }],
      },
    };

    // @ts-ignore
    const action = () => createPolyfillsLoaderConfig(pluginConfig, undefined, bundles);
    expect(action).to.throw();
  });
});
