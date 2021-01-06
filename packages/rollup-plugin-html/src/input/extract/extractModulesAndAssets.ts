import path from 'path';
import { parse, serialize } from 'parse5';
import { extractModules } from './extractModules';
import { extractAssets } from './extractAssets';

export interface ExtractParams {
  html: string;
  htmlFilePath: string;
  rootDir: string;
  extractAssets: boolean;
  absolutePathPrefix?: string;
}

export function extractModulesAndAssets(params: ExtractParams) {
  const { html, htmlFilePath, rootDir, absolutePathPrefix } = params;
  const htmlDir = path.dirname(htmlFilePath);
  const document = parse(html);

  // extract functions mutate the AST
  const { moduleImports, inlineModules } = extractModules({
    document,
    htmlDir,
    rootDir,
    absolutePathPrefix,
  });
  const assets = params.extractAssets
    ? extractAssets({ document, htmlDir, htmlFilePath, rootDir, absolutePathPrefix })
    : [];

  // turn mutated AST back to a string
  const updatedHtmlString = serialize(document);

  return { moduleImports, inlineModules, assets, htmlWithoutModules: updatedHtmlString };
}
