import { findElements, getAttribute, getTagName, getTextContent, remove } from '@web/parse5-utils';
import { Document } from 'parse5';
import path from 'path';
import crypto from 'crypto';
import { resolveAssetFilePath } from '../../assets/utils';

export interface ExtractModulesParams {
  document: Document;
  htmlDir: string;
  rootDir: string;
  absolutePathPrefix?: string;
}

function createContentHash(content: string) {
  return crypto.createHash('md4').update(content).digest('hex');
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

  const moduleImports: string[] = [];
  const inlineModules = new Map<string, string>();

  for (const scriptNode of scriptNodes) {
    const src = getAttribute(scriptNode, 'src');

    if (!src) {
      // turn inline module (<script type="module"> ...code ... </script>)
      const code = getTextContent(scriptNode);
      // inline modules should be relative to the HTML file to resolve relative imports
      // we make it unique with a content hash, so that duplicate modules are deduplicated
      const importPath = path.posix.join(htmlDir, `/inline-module-${createContentHash(code)}.js`);
      inlineModules.set(importPath, code);
      remove(scriptNode);
    } else {
      if (!isAbsolute(src)) {
        // external script <script type="module" src="./foo.js"></script>
        const importPath = resolveAssetFilePath(src, htmlDir, rootDir, absolutePathPrefix);
        moduleImports.push(importPath);
        remove(scriptNode);
      }
    }
  }

  return { moduleImports, inlineModules };
}
