import { Context } from '@web/dev-server-core';
import { getAttribute, getTextContent, remove } from '@web/dev-server-core/dist/dom5';
import { parse, serialize, Document as DocumentAst, Node as NodeAst } from 'parse5';
import {
  injectPolyfillsLoader as originalInjectPolyfillsLoader,
  PolyfillsConfig,
  fileTypes,
  getScriptFileType,
  GeneratedFile,
  File,
} from '@web/polyfills-loader';
import { PARAM_TRANSFORM_SYSTEMJS } from './constants';
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
      const suffix = type === 'module' ? `&${PARAM_TRANSFORM_SYSTEMJS}=true` : '';
      src = `inline-script-${i}.js?source=${encodeURIComponent(indexUrl)}${suffix}`;
      inlineScripts.push({
        path: src,
        type,
        content: getTextContent(scriptNode),
      });
      inlineScriptNodes.push(scriptNode);
    } else if (type === 'module') {
      const separator = src.includes('?') ? '&' : '?';
      src = `${src}${separator}${PARAM_TRANSFORM_SYSTEMJS}=true`;
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
export async function injectPolyfillsLoader(
  context: Context,
  polyfills?: boolean | PolyfillsConfig,
): Promise<ReturnValue> {
  const documentAst = parse(context.body as string);
  const { files, inlineScripts, scriptNodes } = findScripts(context.url, documentAst);

  const polyfillsLoaderConfig = {
    modern: {
      files: files.map(f => ({
        ...f,
        type: f.type === fileTypes.MODULE ? fileTypes.SYSTEMJS : f.type,
      })),
    },
    polyfills:
      polyfills === false
        ? { regeneratorRuntime: 'always' as const }
        : {
            coreJs: true,
            regeneratorRuntime: 'always' as const,
            fetch: true,
            abortController: true,
            webcomponents: true,
            ...(polyfills === true ? {} : polyfills),
          },
    preload: false,
  };

  // we will inject a loader, so we need to remove the inline script nodes as the loader
  // will include them as virtual modules
  for (const scriptNode of scriptNodes) {
    // remove script from document
    remove(scriptNode);
  }

  const result = await originalInjectPolyfillsLoader(serialize(documentAst), polyfillsLoaderConfig);

  return {
    htmlPath: context.url,
    indexHTML: result.htmlString,
    inlineScripts,
    polyfills: result.polyfillFiles,
  };
}
