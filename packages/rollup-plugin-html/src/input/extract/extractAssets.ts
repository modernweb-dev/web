import { Document, serialize } from 'parse5';
import fs from 'fs';
import path from 'path';
import { InputAsset } from '../InputData.js';
import {
  findAssets,
  getSourcePaths,
  isHashedAsset,
  isEntrypointLink,
  resolveAssetFilePath,
  createAssetPicomatchMatcher,
} from '../../assets/utils.js';

export interface ExtractAssetsParams {
  document: Document;
  htmlFilePath: string;
  htmlDir: string;
  rootDir: string;
  extractAssets: boolean | 'legacy-html' | 'legacy-html-and-css';
  externalAssets?: string | string[];
  absolutePathPrefix?: string;
  moduleImportPaths?: string[];
}

export function extractAssets(params: ExtractAssetsParams): InputAsset[] {
  const assetNodes = findAssets(params.document);
  const allAssets: InputAsset[] = [];
  const isExternal = createAssetPicomatchMatcher(params.externalAssets);
  const moduleImportPaths = params.moduleImportPaths ?? [];

  for (const node of assetNodes) {
    const sourcePaths = getSourcePaths(node);
    for (const sourcePath of sourcePaths) {
      if (isExternal(sourcePath)) continue;

      const filePath = resolveAssetFilePath(
        sourcePath,
        params.htmlDir,
        params.rootDir,
        params.absolutePathPrefix,
      );

      if (isEntrypointLink(node, filePath, moduleImportPaths)) continue;

      const hashed = isHashedAsset(node, params.extractAssets);
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
        allAssets.push({ filePath, hashed: hashed, content });
      }
    }
  }

  return allAssets;
}
