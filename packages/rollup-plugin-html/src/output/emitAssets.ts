import { createHash } from 'node:crypto';
import { PluginContext } from 'rollup';
import path from 'path';
import { bundleAsync, transform } from 'lightningcss';
import fs from 'fs';

import { InputAsset, InputData } from '../input/InputData';
import { createAssetPicomatchMatcher } from '../assets/utils.js';
import { RollupPluginHTMLOptions, TransformAssetFunction } from '../RollupPluginHTMLOptions';
import { createAssetPlaceholder } from './css.js';

export interface EmittedAssets {
  static: Map<string, string>;
  hashed: Map<string, string>;
  assetsInCssByHash: Record<string, { ref: string }>;
}

const allowedFileExtensions = [
  /.*\.svg/,
  /.*\.png/,
  /.*\.jpg/,
  /.*\.jpeg/,
  /.*\.webp/,
  /.*\.gif/,
  /.*\.avif/,
  /.*\.woff2/,
  /.*\.woff/,
];

function shouldHandleAsset(url: string) {
  return (
    allowedFileExtensions.some(f => f.test(url)) &&
    !url.startsWith('http') &&
    !url.startsWith('data') &&
    !url.startsWith('#') &&
    !url.startsWith('/')
  );
}

export async function emitAssets(
  this: PluginContext,
  inputs: InputData[],
  options: RollupPluginHTMLOptions,
) {
  const extractAssets = options.extractAssets ?? true;
  const bundleCss = options.bundleCss ?? true;
  const minifyCss = options.minifyCss ?? false;
  const extractAssetsLegacyCss = options.extractAssets === 'legacy-html-and-css';
  const emittedStaticAssets = new Map<string, string>();
  const emittedHashedAssets = new Map<string, string>();
  const emittedStaticAssetNames = new Set();

  const transforms: TransformAssetFunction[] = [];
  if (options.transformAsset) {
    if (Array.isArray(options.transformAsset)) {
      transforms.push(...options.transformAsset);
    } else {
      transforms.push(options.transformAsset);
    }
  }

  async function getTransformedAsset(content: Buffer, filePath: string): Promise<Buffer> {
    let source: Buffer = content;
    for (const transform of transforms) {
      const result = await transform(content, filePath);
      if (result != null) {
        source = typeof result === 'string' ? Buffer.from(result, 'utf-8') : result;
      }
    }
    return source;
  }

  const staticAssets: InputAsset[] = [];
  const hashedAssets: InputAsset[] = [];

  let assetsInCssCounter = 0;
  const assetsInCssByAbsPath: Record<
    string,
    { tempPlaceholder: string; ref?: string; outputPath?: string; hash?: string }
  > = {};
  const assetsInCssByHash: Record<string, { ref: string }> = {};

  for (const input of inputs) {
    for (const asset of input.assets) {
      if (asset.hashed) {
        hashedAssets.push(asset);
      } else {
        staticAssets.push(asset);
      }
    }
  }

  // ensure static assets are last because of https://github.com/rollup/rollup/issues/3853
  const allAssets = [...hashedAssets, ...staticAssets];

  for (const asset of allAssets) {
    const map = asset.hashed ? emittedHashedAssets : emittedStaticAssets;
    if (!map.has(asset.filePath)) {
      let source = await getTransformedAsset(asset.content, asset.filePath);
      let ref: string;
      let basename = path.basename(asset.filePath);
      const isExternal = createAssetPicomatchMatcher(options.externalAssets);
      if (asset.hashed) {
        if (basename.endsWith('.css') && extractAssets) {
          const { code } = await (bundleCss ? bundleAsync : transform)({
            filename: asset.filePath,
            code: asset.content,
            minify: minifyCss,
            visitor: {
              Url: url => {
                // Support foo.svg#bar
                // https://www.w3.org/TR/html4/types.html#:~:text=ID%20and%20NAME%20tokens%20must,tokens%20defined%20by%20other%20attributes.
                const [srcAssetPath, srcAssetId] = url.url.split('#');

                if (shouldHandleAsset(srcAssetPath) && !isExternal(srcAssetPath)) {
                  const assetAbsPath = path.resolve(path.dirname(asset.filePath), srcAssetPath);

                  let assetInCss = assetsInCssByAbsPath[assetAbsPath];

                  if (!assetInCss) {
                    // Avoid duplicates
                    assetsInCssCounter++;
                    assetInCss = {
                      tempPlaceholder: createAssetPlaceholder(assetsInCssCounter.toString()),
                      ref: undefined,
                      hash: undefined,
                    };
                    assetsInCssByAbsPath[assetAbsPath] = assetInCss;
                  }

                  url.url = srcAssetId
                    ? `${assetInCss.tempPlaceholder}#${srcAssetId}`
                    : assetInCss.tempPlaceholder;
                }

                return url;
              },
            },
          });

          let codeString = code.toString();

          for (const assetInCssAbsPath of Object.keys(assetsInCssByAbsPath)) {
            const assetInCss = assetsInCssByAbsPath[assetInCssAbsPath];

            if (!assetInCss.ref) {
              const basename = path.basename(assetInCssAbsPath);
              const content = await fs.promises.readFile(assetInCssAbsPath);
              const transformedContent = await getTransformedAsset(content, assetInCssAbsPath);
              const ref = this.emitFile({
                type: 'asset',
                name: extractAssetsLegacyCss ? `assets/${basename}` : basename,
                originalFileName: assetInCssAbsPath,
                source: transformedContent,
              });
              assetInCss.ref = ref;
              assetInCss.outputPath = this.getFileName(ref);
              if (!extractAssetsLegacyCss) {
                assetInCss.hash = createHash('sha256')
                  .update(transformedContent)
                  .update('\0')
                  .update(assetInCss.outputPath)
                  .digest('hex');
              }
            }

            if (extractAssetsLegacyCss) {
              const outputName = path.basename(assetInCss.outputPath!);
              codeString = codeString.replaceAll(
                assetInCss.tempPlaceholder,
                `assets/${outputName}`,
              );
            } else {
              const hash = assetInCss.hash!;
              assetsInCssByHash[hash] = { ref: assetInCss.ref };
              codeString = codeString.replaceAll(
                assetInCss.tempPlaceholder,
                createAssetPlaceholder(hash),
              );
            }
          }

          const codeBuffer = Buffer.from(codeString);
          if (!asset.content.equals(codeBuffer)) {
            source = codeBuffer;
          }
        }

        ref = this.emitFile({
          type: 'asset',
          name: basename,
          originalFileName: asset.filePath,
          source,
        });
      } else {
        // ensure the output filename is unique
        let i = 1;
        while (emittedStaticAssetNames.has(basename)) {
          const ext = path.extname(basename);
          basename = `${basename.replace(ext, '')}${i}${ext}`;
          i += 1;
        }
        emittedStaticAssetNames.add(basename);
        const fileName = `assets/${basename}`;
        ref = this.emitFile({ type: 'asset', name: basename, fileName, source });
      }

      map.set(asset.filePath, this.getFileName(ref));
    }
  }

  return { static: emittedStaticAssets, hashed: emittedHashedAssets, assetsInCssByHash };
}
