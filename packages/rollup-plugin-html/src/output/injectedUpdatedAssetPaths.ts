import { setAttribute } from '@web/parse5-utils';
import { Document } from 'parse5';
import path from 'path';

import {
  findAssets,
  getSourceAttribute,
  getSourcePath,
  resolveAssetFilePath,
} from '../assets/utils';
import { InputData } from '../input/InputData';
import { createError } from '../utils';
import { toBrowserPath } from './utils';

export function injectedUpdatedAssetPaths(
  document: Document,
  input: InputData,
  rootDir: string,
  assetPaths: Map<string, string>,
  publicPath = './',
) {
  const assetNodes = findAssets(document);
  for (const node of assetNodes) {
    const sourcePath = getSourcePath(node);
    const htmlFilePath = input.filePath ? input.filePath : path.join(rootDir, input.name);
    const htmlDir = path.dirname(htmlFilePath);
    const filePath = resolveAssetFilePath(sourcePath, htmlDir, rootDir);
    const outputPath = assetPaths.get(filePath);

    if (!outputPath) {
      throw createError(
        `Something went wrong while bundling HTML file ${input.name}. Could not find ${filePath} in emitted rollup assets.`,
      );
    }

    const browserPath = path.posix.join(publicPath, toBrowserPath(outputPath));
    const key = getSourceAttribute(node);
    setAttribute(node, key, browserPath);
  }
}
