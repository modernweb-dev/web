import { Plugin, Logger, getRequestFilePath } from '@web/dev-server-core';
import {
  ParsedImportMap,
  parse as parseFromObject,
  parseFromString,
  resolve,
} from '@import-maps/resolve';
import { getHtmlPath } from '@web/dev-server-core';
import { parse as parseHtml, serialize as serializeHtml, Element as ElementAst } from 'parse5';
import path from 'path';

import {
  IMPORT_MAP_PARAM,
  normalizeInjectSetting,
  withImportMapIdParam,
  getRequestImportMapId,
  shouldInject,
  mergeImportMaps,
  getDocumentBaseUrl,
} from './utils';
import { ImportMap } from '@import-maps/resolve';
import {
  createElement,
  findElement,
  findElements,
  getTagName,
  isHtmlFragment,
  getAttribute,
  getTextContent,
  hasAttribute,
  setAttribute,
  setTextContent,
} from '@web/parse5-utils';

export interface ImportMapData {
  htmlPath: string;
  importMap: ParsedImportMap;
  importMapString: string;
}

export interface InjectSetting {
  include?: string;
  exclude?: string;
  importMap: ImportMap;
}

export interface ImportMapsPluginConfig {
  inject?: InjectSetting | InjectSetting[];
}

export interface NormalizedInjectSetting {
  include?: (path: string) => boolean;
  exclude?: (path: string) => boolean;
  importMap: ImportMap;
}

function prepend(parent: any, node: any) {
  // use 'any' because parse5 types are off
  parent.childNodes.unshift(node);
  node.parentNode = parent;
}

export function importMapsPlugin(config: ImportMapsPluginConfig = {}): Plugin {
  const injectSettings = normalizeInjectSetting(config.inject);
  const importMapsById: ImportMapData[] = [];
  const importMapsIdsByHtmlPath = new Map<string, number>();
  let logger: Logger;
  let rootDir: string;

  return {
    name: 'import-map',

    serverStart(args) {
      ({ logger } = args);
      ({ rootDir } = args.config);
    },

    /**
     * Extracts import maps from HTML pages.
     */
    transform(context) {
      if (!context.response.is('html') || isHtmlFragment(context.body as string)) {
        return;
      }

      let toInject = injectSettings.find(i => shouldInject(context.path, i));

      // collect import map in HTML page
      const documentAst = parseHtml(context.body as string);
      const headNode = findElement(documentAst, el => getTagName(el) === 'head');
      if (!headNode) {
        throw new Error('Internal error: HTML document did not generate a <head>.');
      }
      const importMapScripts: ElementAst[] = findElements(
        documentAst,
        el => getTagName(el) === 'script' && getAttribute(el, 'type') === 'importmap',
      );

      if (toInject && importMapScripts.length === 0) {
        // inject import map element into the page
        const script = createElement('script', { type: 'importmap' });
        setTextContent(script, JSON.stringify(toInject.importMap));
        importMapScripts.push(script);
        prepend(headNode, script);
        toInject = undefined;
      }

      if (importMapScripts.length === 0) {
        // HTML page has no import map
        return;
      }

      if (importMapScripts.length !== 1) {
        logger.warn(
          'Multiple import maps on a page are not supported, using the first import map found.',
        );
      }

      const [importMapScript] = importMapScripts;

      if (getAttribute(importMapScript, 'src')) {
        throw new Error('Import maps with a "src" attribute are not yet supported.');
      }
      const htmlPath = getHtmlPath(context.path);
      const importMapString = getTextContent(importMapScript);
      let importMapId = importMapsById.findIndex(i => i.importMapString === importMapString);

      if (importMapId === -1) {
        // this is the first time we encounter this import map for this
        const baseNode = findElement(headNode, el => getTagName(el) === 'base');
        const documentBaseUrl = getDocumentBaseUrl(context, baseNode);

        // parse the import map and store it with the HTML path
        try {
          let importMap = parseFromString(importMapString, documentBaseUrl);

          if (toInject) {
            // we have to inject an import map but there was already one in the HTML file
            // we merge it with the existing import
            const parsedImportMapToInject = parseFromObject(toInject.importMap, documentBaseUrl);
            importMap = mergeImportMaps(parsedImportMapToInject, importMap);
            setTextContent(importMapScript, JSON.stringify(importMap));
            toInject = undefined;
          }

          importMapsById.push({ htmlPath, importMap, importMapString });
          importMapId = importMapsById.length - 1;
        } catch (error) {
          const filePath = getRequestFilePath(context.url, rootDir);
          const relativeFilePath = path.relative(process.cwd(), filePath);
          logger.warn(
            `Failed to parse import map in "${relativeFilePath}": ${(error as Error).message}`,
          );
          return;
        }
      }
      importMapsIdsByHtmlPath.set(htmlPath, importMapId);

      const scripts = findElements(
        documentAst,
        el => getTagName(el) === 'script' && hasAttribute(el, 'src'),
      );
      const links = findElements(
        documentAst,
        el =>
          getTagName(el) === 'link' &&
          ['preload', 'prefetch', 'modulepreload'].includes(getAttribute(el, 'rel') ?? '') &&
          hasAttribute(el, 'href'),
      );

      // add import map id to all script tags
      for (const script of scripts) {
        const src = getAttribute(script, 'src');
        if (src) {
          setAttribute(script, 'src', withImportMapIdParam(src, String(importMapId)));
        }
      }

      // add import map id to all preload links
      for (const link of links) {
        const href = getAttribute(link, 'href');
        if (href) {
          setAttribute(link, 'href', withImportMapIdParam(href, String(importMapId)));
        }
      }
      return serializeHtml(documentAst);
    },

    /**
     * Add import map param to imports in inline modules.
     */
    transformImport({ source, context }) {
      const importMapId = getRequestImportMapId(context, importMapsIdsByHtmlPath);
      if (importMapId == null) {
        return;
      }

      return withImportMapIdParam(source, String(importMapId));
    },

    /**
     * Resolves imports using import maps. When the source file contains an import map
     * search parameter, we look up the associated import map and use that to resolve
     * the import.
     */
    resolveImport({ source, context }) {
      const importMapId = getRequestImportMapId(context, importMapsIdsByHtmlPath);
      if (importMapId == null) {
        return;
      }

      const data = importMapsById[Number(importMapId)];
      if (!data) {
        throw Error(
          `Something went wrong resolving an import map. Could not find import map with id ${importMapId}.` +
            ` Are you adding the URL search parameter ${IMPORT_MAP_PARAM} manually?`,
        );
      }

      const { resolvedImport, matched } = resolve(source, data.importMap, context.URL);
      // console.log({ resolvedImport });
      if (matched && resolvedImport) {
        return resolvedImport.href.startsWith(context.URL.origin)
          ? resolvedImport.pathname
          : resolvedImport.href;
      }
    },
  };
}
