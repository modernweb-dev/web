import { Document, parse, serialize } from 'parse5';
import {
  findElements,
  getAttribute,
  createScript,
  getTextContent,
  insertBefore,
  appendChild,
  createElement,
  findElement,
  getTagName,
} from '@web/parse5-utils';

import { PolyfillsLoaderConfig, PolyfillsLoader, GeneratedFile } from './types';
import { createPolyfillsLoader } from './createPolyfillsLoader';
import { hasFileOfType, fileTypes } from './utils';

function injectImportMapPolyfill(headAst: Document, originalScript: Node, type: string) {
  const systemJsScript = createScript({ type }, getTextContent(originalScript));
  insertBefore(headAst, systemJsScript, originalScript);
}

function findImportMapScripts(document: Document) {
  const scripts = findElements(document, script => getAttribute(script, 'type') === 'importmap');

  const inline: Node[] = [];
  const external: Node[] = [];
  for (const script of scripts) {
    if (getAttribute(script, 'src')) {
      external.push((script as unknown) as Node);
    } else {
      inline.push((script as unknown) as Node);
    }
  }

  return { inline, external };
}

function injectImportMapPolyfills(
  documentAst: Document,
  headAst: Node,
  cfg: PolyfillsLoaderConfig,
) {
  const importMapScripts = findImportMapScripts(documentAst);
  if (importMapScripts.external.length === 0 && importMapScripts.inline.length === 0) {
    return;
  }

  const polyfillSystemJs = hasFileOfType(cfg, fileTypes.SYSTEMJS);

  const importMaps = [...importMapScripts.external, ...importMapScripts.inline];
  importMaps.forEach(originalScript => {
    if (polyfillSystemJs) {
      injectImportMapPolyfill(headAst, originalScript, 'systemjs-importmap');
    }
  });
}

function injectLoaderScript(bodyAst: Document, polyfillsLoader: PolyfillsLoader) {
  const loaderScript = createScript({}, polyfillsLoader.code);
  appendChild(bodyAst, loaderScript);
}

function injectPrefetchLinks(headAst: Document, cfg: PolyfillsLoaderConfig) {
  for (const file of cfg.modern!.files) {
    const { path } = file;
    const href = path.startsWith('.') || path.startsWith('/') ? path : `./${path}`;
    if (file.type === fileTypes.MODULE) {
      appendChild(
        headAst,
        createElement('link', {
          rel: 'preload',
          href,
          as: 'script',
          crossorigin: 'anonymous',
        }),
      );
    } else {
      appendChild(headAst, createElement('link', { rel: 'preload', href, as: 'script' }));
    }
  }
}

export interface InjectPolyfillsLoaderResult {
  htmlString: string;
  polyfillFiles: GeneratedFile[];
}

/**
 * Transforms an index.html file, injecting a polyfills loader for
 * compatibility with older browsers.
 */
export async function injectPolyfillsLoader(
  htmlString: string,
  cfg: PolyfillsLoaderConfig,
): Promise<InjectPolyfillsLoaderResult> {
  const documentAst = parse(htmlString);

  const headAst = (findElement(documentAst, e => getTagName(e) === 'head') as unknown) as Node;
  const bodyAst = (findElement(documentAst, e => getTagName(e) === 'body') as unknown) as Node;

  if (!headAst || !bodyAst) {
    throw new Error(`Invalid index.html: missing <head> or <body>`);
  }

  const polyfillsLoader = await createPolyfillsLoader(cfg);

  if (polyfillsLoader === null) {
    return { htmlString, polyfillFiles: [] };
  }

  if (cfg.preload) {
    injectPrefetchLinks(headAst, cfg);
  }
  injectImportMapPolyfills(documentAst, headAst, cfg);
  injectLoaderScript(bodyAst, polyfillsLoader);

  return {
    htmlString: serialize(documentAst),
    polyfillFiles: polyfillsLoader.polyfillFiles,
  };
}
