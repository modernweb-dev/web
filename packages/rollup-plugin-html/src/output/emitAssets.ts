import { PluginContext } from 'rollup';
import path from 'path';
import { transform } from 'lightningcss';
import fs from 'fs';

import { InputAsset, InputData } from '../input/InputData';
import { createAssetPicomatchMatcher } from '../assets/utils.js';
import { RollupPluginHTMLOptions, TransformAssetFunction } from '../RollupPluginHTMLOptions';

export interface EmittedAssets {
  static: Map<string, string>;
  hashed: Map<string, string>;
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
  const staticAssets: InputAsset[] = [];
  const hashedAssets: InputAsset[] = [];

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
      let source: Buffer = asset.content;

      // run user's transform functions
      for (const transform of transforms) {
        const result = await transform(asset.content, asset.filePath);
        if (result != null) {
          source = typeof result === 'string' ? Buffer.from(result, 'utf-8') : result;
        }
      }

      let ref: string;
      let basename = path.basename(asset.filePath);
      const isExternal = createAssetPicomatchMatcher(options.externalAssets);
      const emittedExternalAssets = new Map();
      if (asset.hashed) {
        if (basename.endsWith('.css') && options.bundleAssetsFromCss) {
          let updatedCssSource = false;
          const { code } = await transform({
            filename: basename,
            code: asset.content,
            minify: false,
            visitor: {
              Url: url => {
                // Support foo.svg#bar
                // https://www.w3.org/TR/html4/types.html#:~:text=ID%20and%20NAME%20tokens%20must,tokens%20defined%20by%20other%20attributes.
                const [filePath, idRef] = url.url.split('#');

                if (shouldHandleAsset(filePath) && !isExternal(filePath)) {
                  // Read the asset file, get the asset from the source location on the FS using asset.filePath
                  const assetLocation = path.resolve(path.dirname(asset.filePath), filePath);
                  const assetContent = fs.readFileSync(assetLocation);

                  // Avoid duplicates
                  if (!emittedExternalAssets.has(assetLocation)) {
                    const fontFileRef = this.emitFile({
                      type: 'asset',
                      name: path.join('assets', path.basename(filePath)),
                      source: assetContent,
                    });
                    const emittedAssetFilePath = path.basename(this.getFileName(fontFileRef));
                    emittedExternalAssets.set(assetLocation, emittedAssetFilePath);
                    // Update the URL in the original CSS file to point to the emitted asset file
                    url.url = `assets/${
                      idRef ? `${emittedAssetFilePath}#${idRef}` : emittedAssetFilePath
                    }`;
                  } else {
                    const emittedAssetFilePath = emittedExternalAssets.get(assetLocation);
                    url.url = `assets/${
                      idRef ? `${emittedAssetFilePath}#${idRef}` : emittedAssetFilePath
                    }`;
                  }
                }
                updatedCssSource = true;
                return url;
              },
            },
          });
          if (updatedCssSource) {
            source = Buffer.from(code);
          }
        }

        ref = this.emitFile({ type: 'asset', name: basename, source });
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

  return { static: emittedStaticAssets, hashed: emittedHashedAssets };
}
