import { Document, serialize } from 'parse5';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { InputAsset } from '../InputData.js';
import {
  findAssets,
  getSourcePaths,
  isHashedAsset,
  resolveAssetFilePath,
} from '../../assets/utils.js';

export interface ExtractAssetsParams {
  document: Document;
  htmlFilePath: string;
  htmlDir: string;
  rootDir: string;
  absolutePathPrefix?: string;
}

export function extractAssets(params: ExtractAssetsParams): InputAsset[] {
  const assetNodes = findAssets(params.document);
  const allAssets: InputAsset[] = [];

  for (const node of assetNodes) {
    const sourcePaths = getSourcePaths(node);
    for (const sourcePath of sourcePaths) {
      const filePath = resolveAssetFilePath(
        sourcePath,
        params.htmlDir,
        params.rootDir,
        params.absolutePathPrefix,
      );
      const hashed = isHashedAsset(node);
      const alreadyHandled = allAssets.find(a => a.filePath === filePath && a.hashed === hashed);
      if (!alreadyHandled) {
        try {
          fs.accessSync(filePath);
        } catch (error) {
          const elStr = serialize(node);
          const htmlPath = path.relative(process.cwd(), params.htmlFilePath);
          throw new Error(
            `Could not find ${filePath} referenced from HTML file ${htmlPath} from element ${elStr}.`,
          );
        }

        const content = fs.readFileSync(filePath);
        allAssets.push({ filePath, hashed, content });
      }
    }
  }

  return allAssets;
}
