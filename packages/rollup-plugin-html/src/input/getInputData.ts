import fs from 'fs';
import path from 'path';
import { globSync, GlobOptionsWithFileTypesFalse } from 'glob';

import { createError } from '../utils.js';
import { RollupPluginHTMLOptions } from '../RollupPluginHTMLOptions.js';
import { InputData } from './InputData.js';
import { normalizeInputOptions } from './normalizeInputOptions.js';
import { extractModulesAndAssets } from './extract/extractModulesAndAssets.js';
import { InputOption } from 'rollup';

function resolveGlob(fromGlob: string, opts: GlobOptionsWithFileTypesFalse) {
  const files = globSync(fromGlob, { ...opts, absolute: true });
  return (
    files
      // filter out directories
      .filter(filePath => !fs.lstatSync(filePath).isDirectory())
  );
}

function getName(filePath: string, rootDir: string, flattenOutput = true) {
  if (flattenOutput) {
    return path.basename(filePath);
  }
  return path.relative(rootDir, filePath);
}

export interface CreateInputDataParams {
  name: string;
  html: string;
  rootDir: string;
  filePath?: string;
  extractAssets: boolean;
  externalAssets?: string | string[];
  absolutePathPrefix?: string;
}

function createInputData(params: CreateInputDataParams): InputData {
  const { name, html, rootDir, filePath, extractAssets, externalAssets, absolutePathPrefix } =
    params;
  const htmlFilePath = filePath ? filePath : path.resolve(rootDir, name);
  const result = extractModulesAndAssets({
    html,
    htmlFilePath,
    rootDir,
    extractAssets,
    externalAssets,
    absolutePathPrefix,
  });

  return {
    html: result.htmlWithoutModules,
    name,
    inlineModules: result.inlineModules,
    moduleImports: [...result.moduleImports, ...result.inlineModules],
    assets: result.assets,
    filePath,
  };
}

export function getInputData(
  pluginOptions: RollupPluginHTMLOptions,
  rollupInput?: InputOption,
): InputData[] {
  const {
    rootDir = process.cwd(),
    flattenOutput,
    extractAssets = true,
    externalAssets,
    absolutePathPrefix,
    exclude: ignore,
  } = pluginOptions;
  const allInputs = normalizeInputOptions(pluginOptions, rollupInput);

  const result: InputData[] = [];
  for (const input of allInputs) {
    if (typeof input.html === 'string') {
      const name = input.name ?? 'index.html';
      const data = createInputData({
        name,
        html: input.html,
        rootDir,
        extractAssets,
        externalAssets,
        absolutePathPrefix,
      });
      result.push(data);
    } else if (typeof input.path === 'string') {
      const filePaths = resolveGlob(input.path, { cwd: rootDir, ignore });
      if (filePaths.length === 0) {
        throw new Error(
          `Could not find any HTML files for pattern: ${input.path}, resolved relative to ${rootDir}`,
        );
      }

      for (const filePath of filePaths) {
        const name = input.name ?? getName(filePath, rootDir, flattenOutput);
        const html = fs.readFileSync(filePath, 'utf-8');
        const data = createInputData({
          name,
          html,
          rootDir,
          filePath,
          extractAssets,
          externalAssets,
          absolutePathPrefix,
        });
        result.push(data);
      }
    } else {
      throw createError('An input must specify either a path or html.');
    }
  }

  for (const input of result) {
    if (result.filter(r => r.name === input.name).length !== 1) {
      throw createError(
        `Found multiple HTML inputs configured with the same name, ` +
          'or with no name which defaults to index.html. Set a unique name on the' +
          'input option.',
      );
    }
  }

  return result;
}
