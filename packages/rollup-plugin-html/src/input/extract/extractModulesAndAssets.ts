import path from 'path';
import { parse, serialize } from 'parse5';
import { extractModules } from './extractModules.js';
import { extractAssets } from './extractAssets.js';

export interface ExtractParams {
  html: string;
  htmlFilePath: string;
  rootDir: string;
  extractAssets: boolean | 'legacy-html' | 'legacy-html-and-css';
  externalAssets?: string | string[];
  absolutePathPrefix?: string;
}

export function extractModulesAndAssets(params: ExtractParams) {
  const { html, htmlFilePath, rootDir, externalAssets, absolutePathPrefix } = params;
  const htmlDir = path.dirname(htmlFilePath);
  const document = parse(html);

  // extract functions mutate the AST
  const { moduleImports, inlineModules } = extractModules({
    document,
    htmlDir,
    rootDir,
    absolutePathPrefix,
  });

  const moduleImportPaths = moduleImports.map(mod => mod.importPath);

  const assets = params.extractAssets
    ? extractAssets({
        document,
        htmlDir,
        htmlFilePath,
        rootDir,
        extractAssets: params.extractAssets,
        externalAssets,
        absolutePathPrefix,
        moduleImportPaths,
      })
    : [];

  // turn mutated AST back to a string
  const updatedHtmlString = serialize(document);

  return { moduleImports, inlineModules, assets, htmlWithoutModules: updatedHtmlString };
}
