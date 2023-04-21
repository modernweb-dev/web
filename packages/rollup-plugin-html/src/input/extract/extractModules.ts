import { findElements, getAttribute, getTagName, getTextContent, remove } from '@web/parse5-utils';
import { Document, Attribute } from 'parse5';
import path from 'path';
import crypto from 'crypto';
import { resolveAssetFilePath } from '../../assets/utils';
import { getAttributes } from '@web/parse5-utils';
import { ScriptModuleTag } from '../../RollupPluginHTMLOptions';

export interface ExtractModulesParams {
  document: Document;
  htmlDir: string;
  rootDir: string;
  absolutePathPrefix?: string;
}

function createContentHash(content: string) {
  return crypto.createHash('md5').update(content).digest('hex');
}

function isAbsolute(src: string) {
  try {
    new URL(src);
    return true;
  } catch {
    return false;
  }
}

export function extractModules(params: ExtractModulesParams) {
  const { document, htmlDir, rootDir, absolutePathPrefix } = params;
  const scriptNodes = findElements(
    document,
    e => getTagName(e) === 'script' && getAttribute(e, 'type') === 'module',
  );

  const moduleImports: ScriptModuleTag[] = [];
  const inlineModules: ScriptModuleTag[] = [];

  for (const scriptNode of scriptNodes) {
    const src = getAttribute(scriptNode, 'src');

    const allAttributes = getAttributes(scriptNode);
    const attributes: Attribute[] = [];
    for (const attributeName of Object.keys(allAttributes)) {
      if (attributeName !== 'src' && attributeName !== 'type') {
        attributes.push({ name: attributeName, value: allAttributes[attributeName] });
      }
    }

    if (!src) {
      // turn inline module (<script type="module"> ...code ... </script>)
      const code = getTextContent(scriptNode);
      // inline modules should be relative to the HTML file to resolve relative imports
      // we make it unique with a content hash, so that duplicate modules are deduplicated
      const importPath = path.posix.join(htmlDir, `/inline-module-${createContentHash(code)}.js`);
      if (!inlineModules.find(tag => tag.importPath === importPath)) {
        inlineModules.push({
          importPath,
          attributes,
          code,
        });
      }
      remove(scriptNode);
    } else {
      if (!isAbsolute(src)) {
        // external script <script type="module" src="./foo.js"></script>
        const importPath = resolveAssetFilePath(src, htmlDir, rootDir, absolutePathPrefix);
        moduleImports.push({
          importPath,
          attributes,
        });
        remove(scriptNode);
      }
    }
  }

  return { moduleImports, inlineModules };
}
