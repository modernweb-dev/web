import path from 'path';
import { expect } from 'chai';

import { PolyfillsLoaderConfig, PolyfillFile } from '../src/types.js';
import { createPolyfillsData } from '../src/createPolyfillsData.js';
import { noModuleSupportTest, fileTypes } from '../src/utils.js';

function cleanupPolyfill(polyfill: PolyfillFile) {
  if (!polyfill) {
    return;
  }
  polyfill.content = '';

  Object.entries(polyfill).forEach(([key, value]) => {
    if (value === undefined) {
      // @ts-ignore
      delete polyfill[key];
    }
  });
}

describe('polyfills', () => {
  it('returns the correct polyfills data', async () => {
    const config: PolyfillsLoaderConfig = {
      modern: { files: [{ type: fileTypes.MODULE, path: 'foo.js' }] },
      polyfills: {
        hash: false,
        coreJs: true,
        webcomponents: true,
        fetch: true,
        intersectionObserver: true,
        resizeObserver: true,
        dynamicImport: true,
        esModuleShims: true,
        constructibleStylesheets: true,
        URLPattern: true,
        scopedCustomElementRegistry: true,
      },
    };

    const polyfillFiles = await createPolyfillsData(config);
    for (const p of polyfillFiles) {
      expect(p.content).to.be.a('string', `Polyfill ${p.name} has no content`);
      cleanupPolyfill(p);
    }

    expect(polyfillFiles).to.eql([
      {
        name: 'core-js',
        type: fileTypes.SCRIPT,
        path: 'polyfills/core-js.js',
        content: '',
        test: "!('noModule' in HTMLScriptElement.prototype)",
      },
      {
        content: '',
        name: 'urlpattern-polyfill',
        path: 'polyfills/urlpattern-polyfill.js',
        test: '"URLPattern" in window',
        type: 'script',
      },
      {
        content: '',
        name: 'es-module-shims',
        path: 'polyfills/es-module-shims.js',
        test: '1',
        type: 'script',
      },
      {
        content: '',
        name: 'constructible-style-sheets-polyfill',
        path: 'polyfills/constructible-style-sheets-polyfill.js',
        test: '!("adoptedStyleSheets" in document)',
        type: 'script',
      },
      {
        name: 'fetch',
        path: 'polyfills/fetch.js',
        test: "!('fetch' in window)",
        content: '',
        type: 'script',
      },
      {
        name: 'dynamic-import',
        initializer:
          "window.dynamicImportPolyfill.initialize({ importFunctionName: 'importShim' });",
        path: 'polyfills/dynamic-import.js',
        test: "'noModule' in HTMLScriptElement.prototype && (function () { try { Function('window.importShim = s => import(s);').call(); return false; } catch (_) { return true; } })()",
        content: '',
        type: 'script',
      },
      {
        name: 'intersection-observer',
        path: 'polyfills/intersection-observer.js',
        test: "!('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype)",
        content: '',
        type: 'script',
      },
      {
        name: 'resize-observer',
        path: 'polyfills/resize-observer.js',
        test: "!('ResizeObserver' in window)",
        content: '',
        type: 'script',
      },
      {
        name: 'scoped-custom-element-registry',
        path: 'polyfills/scoped-custom-element-registry.js',
        test: "!('createElement' in ShadowRoot.prototype)",
        content: '',
        type: 'script',
      },
      {
        name: 'webcomponents',
        path: 'polyfills/webcomponents.js',
        test: "!('attachShadow' in Element.prototype) || !('getRootNode' in Element.prototype) || (window.ShadyDOM && window.ShadyDOM.force)",
        content: '',
        type: 'script',
      },
      {
        name: 'custom-elements-es5-adapter',
        path: 'polyfills/custom-elements-es5-adapter.js',
        test: "!('noModule' in HTMLScriptElement.prototype) && 'getRootNode' in Element.prototype",
        content: '',
        type: 'script',
      },
    ]);
  });

  it('adds abort controller to the fetch polyfill', async () => {
    const config: PolyfillsLoaderConfig = {
      modern: { files: [{ type: fileTypes.MODULE, path: 'foo.js' }] },
      polyfills: {
        hash: false,
        fetch: true,
        abortController: true,
      },
    };
    const polyfillFiles = await createPolyfillsData(config);
    for (const p of polyfillFiles) {
      expect(p.content).to.be.a('string', `Polyfill ${p.name} has no content`);
      cleanupPolyfill(p);
    }

    expect(polyfillFiles).to.eql([
      {
        name: 'fetch',
        path: 'polyfills/fetch.js',
        test: "!('fetch' in window) || !('Request' in window) || !('signal' in window.Request.prototype)",
        content: '',
        type: 'script',
      },
    ]);
  });

  it('handles the shady-css-custom-styles polyfill', async () => {
    const config: PolyfillsLoaderConfig = {
      modern: { files: [{ type: fileTypes.MODULE, path: 'foo.js' }] },
      polyfills: {
        hash: false,
        webcomponents: true,
        shadyCssCustomStyle: true,
      },
    };

    const polyfillFiles = await createPolyfillsData(config);
    for (const p of polyfillFiles) {
      expect(p.content).to.be.a('string', `Polyfill ${p.name} has no content`);
      cleanupPolyfill(p);
    }

    expect(polyfillFiles).to.eql([
      {
        name: 'webcomponents-shady-css-custom-style',
        type: fileTypes.SCRIPT,
        path: 'polyfills/webcomponents-shady-css-custom-style.js',
        content: '',
        test: "!('attachShadow' in Element.prototype) || !('getRootNode' in Element.prototype)",
      },
    ]);
  });

  it("loads systemjs when an entrypoint needs it, including it's test", async () => {
    /** @type {PolyfillsLoaderConfig} */
    const config = {
      modern: { files: [{ type: fileTypes.MODULE, path: 'foo.js' }] },
      legacy: [
        {
          test: noModuleSupportTest,
          files: [{ type: fileTypes.SYSTEMJS, path: 'foo.js' }],
        },
      ],
      polyfills: {
        hash: false,
      },
    };

    const polyfillFiles = await createPolyfillsData(config);
    for (const p of polyfillFiles) {
      expect(p.content).to.be.a('string', `Polyfill ${p.name} has no content`);
      cleanupPolyfill(p);
    }

    expect(polyfillFiles).to.eql([
      {
        name: 'systemjs',
        type: fileTypes.SCRIPT,
        path: 'polyfills/systemjs.js',
        content: '',
        test: "!('noModule' in HTMLScriptElement.prototype)",
      },
    ]);
  });

  it('loads systemjs when an entrypoint needs it, including multiple tests', async () => {
    const config: PolyfillsLoaderConfig = {
      modern: { files: [{ type: fileTypes.MODULE, path: 'foo.js' }] },
      legacy: [
        {
          test: "'foo' in bar",
          files: [{ type: fileTypes.SYSTEMJS, path: 'foo.js' }],
        },
        {
          test: noModuleSupportTest,
          files: [{ type: fileTypes.SYSTEMJS, path: 'foo.js' }],
        },
      ],
      polyfills: {
        hash: false,
      },
    };

    const polyfillFiles = await createPolyfillsData(config);
    for (const p of polyfillFiles) {
      expect(p.content).to.be.a('string', `Polyfill ${p.name} has no content`);
      cleanupPolyfill(p);
    }

    expect(polyfillFiles).to.eql([
      {
        name: 'systemjs',
        type: fileTypes.SCRIPT,
        path: 'polyfills/systemjs.js',
        content: '',
        test: "'foo' in bar || !('noModule' in HTMLScriptElement.prototype)",
      },
    ]);
  });

  it('always loads systemjs if an entrypoint has no tests', async () => {
    const config: PolyfillsLoaderConfig = {
      modern: { files: [{ type: fileTypes.SYSTEMJS, path: 'foo.js' }] },
      polyfills: {
        hash: false,
      },
    };

    const polyfillFiles = await createPolyfillsData(config);
    for (const p of polyfillFiles) {
      expect(p.content).to.be.a('string', `Polyfill ${p.name} has no content`);
      cleanupPolyfill(p);
    }

    expect(polyfillFiles).to.eql([
      {
        name: 'systemjs',
        type: fileTypes.SCRIPT,
        content: '',
        path: 'polyfills/systemjs.js',
      },
    ]);
  });

  it('can load custom polyfills', async () => {
    const custom = [
      {
        name: 'polyfill-a',
        test: "'foo' in window",
        content: '',
        path: path.resolve(__dirname, 'custom-polyfills/polyfill-a.js'),
      },
      {
        name: 'polyfill-b',
        content: '',
        path: path.resolve(__dirname, 'custom-polyfills/polyfill-b.js'),
      },
    ];

    const config: PolyfillsLoaderConfig = {
      modern: { files: [{ type: fileTypes.MODULE, path: 'foo.js' }] },
      polyfills: {
        hash: false,
        coreJs: true,
        webcomponents: false,
        fetch: false,
        intersectionObserver: false,
        custom,
      },
    };

    const polyfillFiles = await createPolyfillsData(config);
    for (const p of polyfillFiles) {
      expect(p.content).to.be.a('string', `Polyfill ${p.name} has no content`);
      cleanupPolyfill(p);
    }

    expect(polyfillFiles).to.eql([
      {
        name: 'core-js',
        type: fileTypes.SCRIPT,
        path: 'polyfills/core-js.js',
        content: '',
        test: "!('noModule' in HTMLScriptElement.prototype)",
      },
      {
        name: 'polyfill-a',
        type: fileTypes.SCRIPT,
        path: 'polyfills/polyfill-a.js',
        content: '',
        test: "'foo' in window",
      },
      {
        name: 'polyfill-b',
        type: fileTypes.SCRIPT,
        content: '',
        path: 'polyfills/polyfill-b.js',
      },
    ]);
  });

  it('loads systemjs separatly if requested', async () => {
    const config: PolyfillsLoaderConfig = {
      polyfills: {
        hash: false,
        systemjs: true,
      },
    };

    const polyfillFiles = await createPolyfillsData(config);
    for (const p of polyfillFiles) {
      expect(p.content).to.be.a('string', `Polyfill ${p.name} has no content`);
      cleanupPolyfill(p);
    }

    expect(polyfillFiles).to.eql([
      {
        name: 'systemjs',
        type: fileTypes.SCRIPT,
        content: '',
        path: 'polyfills/systemjs.js',
      },
    ]);
  });
});
