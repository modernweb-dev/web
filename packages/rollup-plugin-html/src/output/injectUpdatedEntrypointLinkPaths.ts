import { Document, Element } from 'parse5';
import { findElements, getAttribute, getTagName, setAttribute } from '@web/parse5-utils';
import path from 'path';
import { resolveAssetFilePath } from '../assets/utils.js';
import { EntrypointBundle } from '../RollupPluginHTMLOptions.js';
import { InputData } from '../input/InputData.js';

export interface InjectUpdatedEntrypointLinkPathsArgs {
  document: Document;
  input: InputData;
  rootDir: string;
  entrypointBundles: Record<string, EntrypointBundle>;
  absolutePathPrefix?: string;
}

export function injectUpdatedEntrypointLinkPaths(args: InjectUpdatedEntrypointLinkPathsArgs) {
  const { document, input, rootDir, entrypointBundles, absolutePathPrefix } = args;

  const originalFilePathToBundledPath: Record<string, string> = {};
  for (const { entrypoints } of Object.values(entrypointBundles)) {
    for (const entrypoint of entrypoints) {
      if (entrypoint.chunk?.facadeModuleId) {
        originalFilePathToBundledPath[entrypoint.chunk.facadeModuleId] = entrypoint.importPath;
      }
    }
  }

  const htmlFilePath = input.filePath ? input.filePath : path.join(rootDir, input.name);
  const htmlDir = path.dirname(htmlFilePath);

  const linkElements = findElements(document, (node: Element) => getTagName(node) === 'link');

  for (const link of linkElements) {
    const href = getAttribute(link, 'href');
    if (!href) continue;

    const filePath = resolveAssetFilePath(href, htmlDir, rootDir, absolutePathPrefix);
    const bundledPath = originalFilePathToBundledPath[filePath];
    if (bundledPath) {
      setAttribute(link, 'href', bundledPath);
    }
  }
}
