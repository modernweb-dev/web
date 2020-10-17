import path from 'path';
import { parse, serialize } from 'parse5';
import { findElements, getTagName, getAttribute, getTextContent, remove } from '@web/parse5-utils';
import crypto from 'crypto';

function createContentHash(content: string) {
  return crypto.createHash('md4').update(content).digest('hex');
}

export function extractModules(html: string, modulesBase: string, projectRootDir = process.cwd()) {
  const documentAst = parse(html);
  const scriptNodes = findElements(documentAst, e => getTagName(e) === 'script');

  const moduleImports: string[] = [];
  const inlineModules = new Map<string, string>();

  for (const scriptNode of scriptNodes) {
    const src = getAttribute(scriptNode, 'src');

    if (!src) {
      // turn inline module (<script type="module"> ...code ... </script>)
      const code = getTextContent(scriptNode);
      // inline modules should be relative to the HTML file to resolve relative imports
      // we make it unique with a content hash, so that duplicate modules are deduplicated
      const importPath = path.posix.join(
        modulesBase,
        `/inline-module-${createContentHash(code)}.js`,
      );
      inlineModules.set(importPath, code);
    } else {
      // external script <script type="module" src="./foo.js"></script>
      const importPath = path.join(
        src.startsWith('/') ? projectRootDir : modulesBase,
        src.split('/').join(path.sep),
      );
      moduleImports.push(importPath);
    }

    remove(scriptNode);
  }

  const updatedHtmlString = serialize(documentAst);

  return { moduleImports, inlineModules, htmlWithoutModules: updatedHtmlString };
}
