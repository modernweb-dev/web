import { Attribute } from 'parse5';
import path from 'path';
import { OutputChunk } from 'rollup';

import {
  EntrypointBundle,
  GeneratedBundle,
  RollupPluginHTMLOptions,
  ScriptModuleTag,
} from '../RollupPluginHTMLOptions';
import { createError, NOOP_IMPORT } from '../utils';
import { toBrowserPath } from './utils';

export interface CreateImportPathParams {
  publicPath?: string;
  outputDir: string;
  fileOutputDir: string;
  htmlFileName: string;
  fileName: string;
}

export function createImportPath(params: CreateImportPathParams) {
  const { publicPath, outputDir, fileOutputDir, htmlFileName, fileName } = params;
  const pathFromMainToFileDir = path.relative(outputDir, fileOutputDir);
  let importPath;
  if (publicPath) {
    importPath = toBrowserPath(path.join(publicPath, pathFromMainToFileDir, fileName));
  } else {
    const pathFromHtmlToOutputDir = path.relative(
      path.dirname(htmlFileName),
      pathFromMainToFileDir,
    );
    importPath = toBrowserPath(path.join(pathFromHtmlToOutputDir, fileName));
  }

  if (importPath.startsWith('http') || importPath.startsWith('/') || importPath.startsWith('.')) {
    return importPath;
  }
  return `./${importPath}`;
}

export interface GetEntrypointBundlesParams {
  pluginOptions: RollupPluginHTMLOptions;
  generatedBundles: GeneratedBundle[];
  outputDir: string;
  inputModuleIds: ScriptModuleTag[];
  htmlFileName: string;
}

interface Entrypoint {
  importPath: string;
  chunk: OutputChunk;
  attributes?: Attribute[];
}

export function getEntrypointBundles(params: GetEntrypointBundlesParams) {
  const { pluginOptions, generatedBundles, inputModuleIds, outputDir, htmlFileName } = params;
  const entrypointBundles: Record<string, EntrypointBundle> = {};

  for (const { name, options, bundle } of generatedBundles) {
    if (!options.format) {
      throw createError('Missing module format');
    }

    const entrypoints: Entrypoint[] = [];
    for (const chunkOrAsset of Object.values(bundle)) {
      if (chunkOrAsset.type === 'chunk') {
        const chunk = chunkOrAsset;
        if (chunk.isEntry && chunk.facadeModuleId !== NOOP_IMPORT.importPath) {
          const found = inputModuleIds.find(mod => mod.importPath === chunk.facadeModuleId);
          if (chunk.facadeModuleId && found) {
            const importPath = createImportPath({
              publicPath: pluginOptions.publicPath,
              outputDir,
              fileOutputDir: options.dir ?? '',
              htmlFileName,
              fileName: chunkOrAsset.fileName,
            });
            entrypoints.push({ importPath, chunk: chunkOrAsset, attributes: found.attributes });
          }
        }
      }
    }
    entrypointBundles[name] = { name, options, bundle, entrypoints };
  }

  return entrypointBundles;
}
