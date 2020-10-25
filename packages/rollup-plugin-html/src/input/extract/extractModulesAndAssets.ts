import path from 'path';
import { parse, serialize } from 'parse5';
import { extractModules } from './extractModules';
import { extractAssets } from './extractAssets';

export interface ExtractParams {
  html: string;
  htmlFilePath: string;
  rootDir: string;
  extractAssets: boolean;
}

export function extractModulesAndAssets(params: ExtractParams) {
  const { html, htmlFilePath, rootDir } = params;
  const htmlDir = path.dirname(htmlFilePath);
  const document = parse(html);

  // extract functions mutate the AST
  const { moduleImports, inlineModules } = extractModules({ document, htmlDir, rootDir });
  const assets = params.extractAssets
    ? extractAssets({ document, htmlDir, htmlFilePath, rootDir })
    : [];

  // turn mutated AST back to a string
  const updatedHtmlString = serialize(document);

  return { moduleImports, inlineModules, assets, htmlWithoutModules: updatedHtmlString };
}
