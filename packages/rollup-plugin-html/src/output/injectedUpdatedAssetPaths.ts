import { getAttribute, setAttribute } from '@web/parse5-utils';
import { Document } from 'parse5';
import path from 'path';

import {
  findAssets,
  getSourceAttribute,
  getSourcePaths,
  isHashedAsset,
  resolveAssetFilePath,
} from '../assets/utils';
import { InputData } from '../input/InputData';
import { createError } from '../utils';
import { EmittedAssets } from './emitAssets';
import { toBrowserPath } from './utils';

export interface InjectUpdatedAssetPathsArgs {
  document: Document;
  input: InputData;
  outputDir: string;
  rootDir: string;
  emittedAssets: EmittedAssets;
  publicPath?: string;
  absolutePathPrefix?: string;
}

function getSrcSetUrlWidthPairs(srcset: string) {
  if (!srcset) {
    return [];
  }
  const srcsetParts = srcset.includes(',') ? srcset.split(',') : [srcset];
  const urls = srcsetParts
    .map(url => url.trim())
    .map(url => (url.includes(' ') ? url.split(' ') : [url]));
  return urls;
}

export function injectedUpdatedAssetPaths(args: InjectUpdatedAssetPathsArgs) {
  const {
    document,
    input,
    outputDir,
    rootDir,
    emittedAssets,
    publicPath = './',
    absolutePathPrefix,
  } = args;
  const assetNodes = findAssets(document);

  for (const node of assetNodes) {
    const sourcePaths = getSourcePaths(node);
    for (const sourcePath of sourcePaths) {
      const htmlFilePath = input.filePath ? input.filePath : path.join(rootDir, input.name);
      const htmlDir = path.dirname(htmlFilePath);
      const filePath = resolveAssetFilePath(sourcePath, htmlDir, rootDir, absolutePathPrefix);
      const assetPaths = isHashedAsset(node) ? emittedAssets.hashed : emittedAssets.static;
      const relativeOutputPath = assetPaths.get(filePath);

      if (!relativeOutputPath) {
        throw createError(
          `Something went wrong while bundling HTML file ${input.name}. Could not find ${filePath} in emitted rollup assets.`,
        );
      }
      const htmlOutputFilePath = path.join(outputDir, input.name);
      const htmlOutputDir = path.dirname(htmlOutputFilePath);
      const absoluteOutputPath = path.join(outputDir, relativeOutputPath);
      const relativePathToHtmlFile = path.relative(htmlOutputDir, absoluteOutputPath);

      const browserPath = path.posix.join(publicPath, toBrowserPath(relativePathToHtmlFile));
      const key = getSourceAttribute(node);

      let newAttributeValue = browserPath;
      if (key === 'srcset') {
        const srcset = getAttribute(node, key);
        if (srcset) {
          const urlWidthPairs = getSrcSetUrlWidthPairs(srcset);
          for (const urlWidthPair of urlWidthPairs) {
            if (urlWidthPair[0] === sourcePath) {
              urlWidthPair[0] = browserPath;
            }
          }
          newAttributeValue = urlWidthPairs.map(urlWidthPair => urlWidthPair.join(' ')).join(', ');
        }
      }

      setAttribute(node, key, newAttributeValue);
    }
  }
}
