import fs from 'fs';
import path from 'path';
import glob from 'glob';

import { createError } from '../utils';
import { RollupPluginHTMLOptions } from '../RollupPluginHTMLOptions';
import { InputHTMLData } from './InputHTMLData';
import { normalizeInputOptions } from './normalizeInputOptions';
import { extractModules } from './extractModules';
import { InputOption } from 'rollup';

function resolveGlob(fromGlob: string, rootDir: string) {
  const files = glob.sync(fromGlob, { cwd: rootDir, absolute: true });
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

function createInputHTMLData(
  name: string,
  html: string,
  htmlRootDir: string,
  filePath?: string,
): InputHTMLData {
  const modulesBase = filePath ? path.dirname(filePath) : htmlRootDir;
  const result = extractModules(html, modulesBase);

  return {
    html: result.htmlWithoutModules,
    name,
    inlineModules: result.inlineModules,
    moduleImports: [...result.moduleImports, ...result.inlineModules.keys()],
    filePath,
  };
}

export function getInputHTMLData(
  pluginOptions: RollupPluginHTMLOptions,
  rollupInput?: InputOption,
): InputHTMLData[] {
  const { rootDir = process.cwd(), flattenOutput } = pluginOptions;
  const allInputs = normalizeInputOptions(pluginOptions, rollupInput);

  const result: InputHTMLData[] = [];
  for (const input of allInputs) {
    if (typeof input.html === 'string') {
      const data = createInputHTMLData(input.name ?? 'index.html', input.html, rootDir);
      result.push(data);
    } else if (typeof input.path === 'string') {
      const filePaths = resolveGlob(input.path, rootDir);
      if (filePaths.length === 0) {
        throw new Error(
          `Could not find any HTML files for pattern: ${input.path}, resolved relative to ${rootDir}`,
        );
      }

      for (const filePath of filePaths) {
        const data = createInputHTMLData(
          input.name ?? getName(filePath, rootDir, flattenOutput),
          fs.readFileSync(filePath, 'utf-8'),
          rootDir,
          filePath,
        );
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
