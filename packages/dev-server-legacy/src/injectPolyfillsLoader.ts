import { Context, getHtmlPath } from '@web/dev-server-core';
import { getAttribute, getTextContent, remove } from '@web/dev-server-core/dist/dom5';
import { parse, serialize, Document as DocumentAst, Node as NodeAst } from 'parse5';
import {
  injectPolyfillsLoader as originalInjectPolyfillsLoader,
  fileTypes,
  getScriptFileType,
  GeneratedFile,
  File,
} from 'polyfills-loader';
import { findJsScripts } from './findJsScripts';

function findScripts(indexUrl: string, documentAst: DocumentAst) {
  const scriptNodes = findJsScripts(documentAst);

  const files: File[] = [];
  const inlineScripts: GeneratedFile[] = [];
  const inlineScriptNodes: NodeAst[] = [];
  scriptNodes.forEach((scriptNode, i) => {
    const type = getScriptFileType(scriptNode);
    let src = getAttribute(scriptNode, 'src');

    if (!src) {
      src = `inline-script-${i}.js?source=${encodeURIComponent(indexUrl)}`;
      inlineScripts.push({
        path: src,
        type,
        content: getTextContent(scriptNode),
      });
      inlineScriptNodes.push(scriptNode);
    }

    files.push({
      type,
      path: src,
    });
  });

  return { files, inlineScripts, scriptNodes, inlineScriptNodes };
}

export interface ReturnValue {
  htmlPath: string;
  indexHTML: string;
  inlineScripts: GeneratedFile[];
  polyfills: GeneratedFile[];
}

/**
 * transforms index.html, extracting any modules and import maps and adds them back
 * with the appropriate polyfills, shims and a script loader so that they can be loaded
 * at the right time
 */
export async function injectPolyfillsLoader(context: Context): Promise<ReturnValue> {
  const htmlPath = getHtmlPath(context.path);
  const documentAst = parse(context.body);
  const { files, inlineScripts, scriptNodes } = findScripts(htmlPath, documentAst);

  const polyfillsLoaderConfig = {
    modern: {
      files: files.map(f => ({
        ...f,
        type: f.type === fileTypes.MODULE ? fileTypes.SYSTEMJS : f.type,
      })),
    },
    polyfills: {
      coreJs: true,
      regeneratorRuntime: 'always' as const,
      fetch: true,
      abortController: true,
      webcomponents: true,
    },
    preload: false,
  };

  // we will inject a loader, so we need to remove the inline script nodes as the loader
  // will include them as virtual modules
  for (const scriptNode of scriptNodes) {
    // remove script from document
    remove(scriptNode);
  }

  const result = originalInjectPolyfillsLoader(serialize(documentAst), polyfillsLoaderConfig);

  return {
    htmlPath,
    indexHTML: result.htmlString,
    inlineScripts,
    polyfills: result.polyfillFiles,
  };
}
