import { Document, Node, ParentNode, ChildNode, Element } from 'parse5/dist/tree-adapters/default';
import { parse, serialize } from 'parse5';
import {
  queryAll,
  getAttribute,
  getTextContent,
  isElementNode,
  setTextContent,
  spliceChildren,
  appendChild,
  createElement,
  query,
} from '@parse5/tools';

import { PolyfillsLoaderConfig, PolyfillsLoader, GeneratedFile } from './types';
import { createPolyfillsLoader } from './createPolyfillsLoader';
import { hasFileOfType, fileTypes } from './utils';

function injectImportMapPolyfill(headAst: ParentNode, originalScript: Node, type: string) {
  const systemJsScript = createElement('script', { type });
  setTextContent(systemJsScript, getTextContent(originalScript));
  spliceChildren(
    headAst,
    headAst.childNodes.indexOf(originalScript as ChildNode) - 1,
    0,
    systemJsScript,
  );
}

function findImportMapScripts(document: Document) {
  const scripts = queryAll<Element>(
    document,
    script => isElementNode(script) && getAttribute(script, 'type') === 'importmap',
  );

  const inline: Node[] = [];
  const external: Node[] = [];
  for (const script of scripts) {
    if (getAttribute(script, 'src')) {
      external.push(script);
    } else {
      inline.push(script);
    }
  }

  return { inline, external };
}

function injectImportMapPolyfills(
  documentAst: Document,
  headAst: ParentNode,
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

function injectLoaderScript(
  bodyAst: ParentNode,
  polyfillsLoader: PolyfillsLoader,
  cfg: PolyfillsLoaderConfig,
) {
  let loaderScript: Element;
  if (cfg.externalLoaderScript) {
    const loaderScriptFile = polyfillsLoader.polyfillFiles.find(f => f.path.endsWith('loader.js'));
    if (!loaderScriptFile) {
      throw new Error('Missing polyfills loader script file');
    }
    loaderScript = createElement('script', { src: loaderScriptFile.path });
  } else {
    loaderScript = createElement('script', {});
    setTextContent(loaderScript, polyfillsLoader.code);
  }
  appendChild(bodyAst, loaderScript);
}

function injectPrefetchLinks(headAst: ParentNode, cfg: PolyfillsLoaderConfig) {
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

  const headAst = query<Element>(documentAst, e => isElementNode(e) && e.tagName === 'head');
  const bodyAst = query<Element>(documentAst, e => isElementNode(e) && e.tagName === 'body');

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
  injectLoaderScript(bodyAst, polyfillsLoader, cfg);

  return {
    htmlString: serialize(documentAst),
    polyfillFiles: polyfillsLoader.polyfillFiles,
  };
}
