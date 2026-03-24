import path from 'path';
import { fileURLToPath } from 'node:url';
import fs from 'fs';
import { minify } from 'terser';
import type { PolyfillsLoaderConfig, PolyfillConfig, PolyfillFile } from './types.ts';
import { createContentHash, noModuleSupportTest, hasFileOfType, fileTypes } from './utils.ts';

export async function createPolyfillsData(cfg: PolyfillsLoaderConfig): Promise<PolyfillFile[]> {
  const { polyfills = {} } = cfg;

  const polyfillConfigs: PolyfillConfig[] = [];

  function addPolyfillConfig(polyfillConfig: PolyfillConfig) {
    try {
      polyfillConfigs.push(polyfillConfig);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'MODULE_NOT_FOUND') {
        throw new Error(
          `[Polyfills loader]: Error resolving polyfill ${polyfillConfig.name}` +
            ' Are dependencies installed correctly?',
        );
      }

      throw error;
    }
  }

  if (polyfills.coreJs) {
    const coreJsPath = await import.meta.resolve('core-js-bundle/minified.js');
    addPolyfillConfig({
      name: 'core-js',
      path: fileURLToPath(coreJsPath),
      test: noModuleSupportTest,
    });
  }

  if (polyfills.URLPattern) {
    const urlPatternPath = await import.meta.resolve('urlpattern-polyfill');
    addPolyfillConfig({
      name: 'urlpattern-polyfill',
      test: '"URLPattern" in window',
      path: fileURLToPath(urlPatternPath),
    });
  }

  if (polyfills.esModuleShims) {
    const esModuleShimsPath = await import.meta.resolve('es-module-shims');
    addPolyfillConfig({
      name: 'es-module-shims',
      test: polyfills.esModuleShims !== 'always' ? '1' : undefined,
      path: fileURLToPath(esModuleShimsPath),
      minify: true,
    });
  }

  if (polyfills.constructibleStylesheets) {
    const constructibleStylesheetsPath = await import.meta
      .resolve('construct-style-sheets-polyfill');
    addPolyfillConfig({
      name: 'constructible-style-sheets-polyfill',
      test: '!("adoptedStyleSheets" in document)',
      path: fileURLToPath(constructibleStylesheetsPath),
    });
  }

  if (polyfills.regeneratorRuntime) {
    const regeneratorRuntimePath = await import.meta.resolve('regenerator-runtime/runtime');
    addPolyfillConfig({
      name: 'regenerator-runtime',
      test: polyfills.regeneratorRuntime !== 'always' ? noModuleSupportTest : undefined,
      path: fileURLToPath(regeneratorRuntimePath),
    });
  }

  if (polyfills.fetch) {
    const fetchPath = await import.meta.resolve('whatwg-fetch/dist/fetch.umd.js');
    const paths = [fileURLToPath(fetchPath)];

    if (polyfills.abortController) {
      const abortPath = await import.meta.resolve('abortcontroller-polyfill/dist/umd-polyfill.js');
      paths.push(fileURLToPath(abortPath));
    }

    addPolyfillConfig({
      name: 'fetch',
      test: `!('fetch' in window)${
        polyfills.abortController
          ? " || !('Request' in window) || !('signal' in window.Request.prototype)"
          : ''
      }`,
      path: paths,
      minify: true,
    });
  }

  if (polyfills.abortController && !polyfills.fetch) {
    throw new Error('Cannot polyfill AbortController without fetch.');
  }

  // load systemjs, an es module polyfill, if one of the entries needs it
  const hasSystemJs =
    cfg.polyfills && cfg.polyfills.custom && cfg.polyfills.custom.find(c => c.name === 'systemjs');
  if (
    polyfills.systemjs ||
    polyfills.systemjsExtended ||
    (!hasSystemJs && hasFileOfType(cfg, fileTypes.SYSTEMJS))
  ) {
    const name = 'systemjs';
    const alwaysLoad =
      cfg.modern && cfg.modern.files && cfg.modern.files.some(f => f.type === fileTypes.SYSTEMJS);
    const test = alwaysLoad || !cfg.legacy ? undefined : cfg.legacy.map(e => e.test).join(' || ');

    if (polyfills.systemjsExtended) {
      // full systemjs, including import maps polyfill
      const systemjsPath = await import.meta.resolve('systemjs/dist/system.min.js');
      addPolyfillConfig({
        name,
        test,
        path: fileURLToPath(systemjsPath),
      });
    } else {
      // plain systemjs as es module polyfill
      const systemjsPath = await import.meta.resolve('systemjs/dist/s.min.js');
      addPolyfillConfig({
        name,
        test,
        path: fileURLToPath(systemjsPath),
      });
    }
  }

  if (polyfills.dynamicImport) {
    const dynamicImportPath = await import.meta
      .resolve('dynamic-import-polyfill/dist/dynamic-import-polyfill.umd.js');
    addPolyfillConfig({
      name: 'dynamic-import',
      /**
       * dynamic import is syntax, not an actual function so we cannot feature detect it without using an import statement.
       * using a dynamic import on a browser which doesn't support it throws a syntax error and prevents the entire script
       * from being run, so we need to dynamically create and execute a function and catch the error.
       *
       * CSP can block the dynamic function, in which case the polyfill will always be loaded which is ok. The polyfill itself
       * uses Blob, which might be blocked by CSP as well. In that case users should use systemjs instead.
       */
      test:
        "'noModule' in HTMLScriptElement.prototype && " +
        "(function () { try { Function('window.importShim = s => import(s);').call(); return false; } catch (_) { return true; } })()",
      path: fileURLToPath(dynamicImportPath),
      initializer: "window.dynamicImportPolyfill.initialize({ importFunctionName: 'importShim' });",
    });
  }

  if (polyfills.intersectionObserver) {
    const intersectionObserverPath = await import.meta
      .resolve('intersection-observer/intersection-observer.js');
    addPolyfillConfig({
      name: 'intersection-observer',
      test: "!('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype)",
      path: fileURLToPath(intersectionObserverPath),
      minify: true,
    });
  }

  if (polyfills.resizeObserver) {
    const resizeObserverPath = await import.meta
      .resolve('resize-observer-polyfill/dist/ResizeObserver.global.js');
    addPolyfillConfig({
      name: 'resize-observer',
      test: "!('ResizeObserver' in window)",
      path: fileURLToPath(resizeObserverPath),
      minify: true,
    });
  }

  if (polyfills.scopedCustomElementRegistry) {
    const scopedRegistryPath = await import.meta
      .resolve('@webcomponents/scoped-custom-element-registry/scoped-custom-element-registry.min.js');
    addPolyfillConfig({
      name: 'scoped-custom-element-registry',
      test: "!('createElement' in ShadowRoot.prototype)",
      path: fileURLToPath(scopedRegistryPath),
    });
  }

  if (polyfills.webcomponents && !polyfills.shadyCssCustomStyle) {
    const webcomponentsPath = await import.meta
      .resolve('@webcomponents/webcomponentsjs/webcomponents-bundle.js');
    addPolyfillConfig({
      name: 'webcomponents',
      test: "!('attachShadow' in Element.prototype) || !('getRootNode' in Element.prototype) || (window.ShadyDOM && window.ShadyDOM.force)",
      path: fileURLToPath(webcomponentsPath),
    });

    // If a browser does not support nomodule attribute, but does support custom elements, we need
    // to load the custom elements es5 adapter. This is the case for Safari 10.1
    const es5AdapterPath = await import.meta
      .resolve('@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js');
    addPolyfillConfig({
      name: 'custom-elements-es5-adapter',
      test: "!('noModule' in HTMLScriptElement.prototype) && 'getRootNode' in Element.prototype",
      path: fileURLToPath(es5AdapterPath),
    });
  }

  if (polyfills.webcomponents && polyfills.shadyCssCustomStyle) {
    // shadycss/custom-style-interface polyfill *must* load after the webcomponents polyfill or it doesn't work.
    // to get around that, concat the two together.

    const webcomponentsBundlePath = await import.meta
      .resolve('@webcomponents/webcomponentsjs/webcomponents-bundle.js');
    const customStylePath = await import.meta
      .resolve('@webcomponents/shadycss/custom-style-interface.min.js');
    const shadyCssScopedPath = await import.meta
      .resolve('shady-css-scoped-element/shady-css-scoped-element.min.js');

    addPolyfillConfig({
      name: 'webcomponents-shady-css-custom-style',
      test: "!('attachShadow' in Element.prototype) || !('getRootNode' in Element.prototype)",
      path: [
        fileURLToPath(webcomponentsBundlePath),
        fileURLToPath(customStylePath),
        fileURLToPath(shadyCssScopedPath),
      ],
    });
  }

  polyfillConfigs.push(...(polyfills.custom || []));

  function readPolyfillFileContents(filePath: string): string {
    const codePath = path.resolve(filePath);
    if (!codePath || !fs.existsSync(codePath) || !fs.statSync(codePath).isFile()) {
      throw new Error(`Could not find a file at ${filePath}`);
    }

    const contentLines = fs.readFileSync(filePath, 'utf-8').split('\n');

    // remove source map url
    for (let i = contentLines.length - 1; i >= 0; i -= 1) {
      if (contentLines[i].startsWith('//# sourceMappingURL')) {
        contentLines[i] = '';
      }
    }
    return contentLines.join('\n');
  }

  const polyfillFiles: PolyfillFile[] = [];

  for (const polyfillConfig of polyfillConfigs) {
    if (!polyfillConfig.name || !polyfillConfig.path) {
      throw new Error(`A polyfill should have a name and a path property.`);
    }
    let content = '';
    if (Array.isArray(polyfillConfig.path)) {
      content = polyfillConfig.path.map(p => readPolyfillFileContents(p)).join('');
    } else {
      content = readPolyfillFileContents(polyfillConfig.path);
    }
    if (polyfillConfig.minify) {
      const minifyResult = await minify(content, { sourceMap: false });
      // @ts-ignore
      content = minifyResult.code;
    }

    const filePath = `${path.posix.join(
      cfg.polyfillsDir || 'polyfills',
      `${polyfillConfig.name}${polyfills.hash !== false ? `.${createContentHash(content)}` : ''}`,
    )}.js`;

    const polyfillFile = {
      name: polyfillConfig.name,
      type: polyfillConfig.fileType || fileTypes.SCRIPT,
      path: filePath,
      content,
      test: polyfillConfig.test,
      initializer: polyfillConfig.initializer,
    };

    polyfillFiles.push(polyfillFile);
  }

  return polyfillFiles;
}
