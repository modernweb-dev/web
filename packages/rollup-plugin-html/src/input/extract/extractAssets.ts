import { Document, serialize } from 'parse5';
import fs from 'fs';
import path from 'path';
import { InputAsset } from '../InputData';
import { findAssets, getSourcePath, resolveAssetFilePath } from '../../assets/utils';

export interface ExtractAssetsParams {
  document: Document;
  htmlFilePath: string;
  htmlDir: string;
  rootDir: string;
}

export function extractAssets(params: ExtractAssetsParams): InputAsset[] {
  const assetNodes = findAssets(params.document);
  const allAssets: InputAsset[] = [];

  for (const node of assetNodes) {
    const sourcePath = getSourcePath(node);
    const filePath = resolveAssetFilePath(sourcePath, params.htmlDir, params.rootDir);
    const alreadyHandled = allAssets.find(a => a.filePath === filePath);
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
      allAssets.push({ filePath, content });
    }
  }

  return allAssets;
}
