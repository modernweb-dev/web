import { Document, Node, ParentNode, parse, serialize } from 'parse5';
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
  Element,
} from '@web/parse5-utils';

import { PolyfillsLoaderConfig, PolyfillsLoader, GeneratedFile } from './types';
import { createPolyfillsLoader } from './createPolyfillsLoader';
import { hasFileOfType, fileTypes } from './utils';

function injectImportMapPolyfill(headAst: ParentNode, originalScript: Node, type: string) {
  const systemJsScript = createScript({ type }, getTextContent(originalScript));
  insertBefore(headAst, systemJsScript, originalScript);
}

function findImportMapScripts(document: Document) {
  const scripts = findElements(document, script => getAttribute(script, 'type') === 'importmap');

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
    loaderScript = createScript({ src: loaderScriptFile.path });
  } else {
    loaderScript = createScript({}, polyfillsLoader.code);
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

  const headAst = findElement(documentAst, e => getTagName(e) === 'head');
  const bodyAst = findElement(documentAst, e => getTagName(e) === 'body');

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
