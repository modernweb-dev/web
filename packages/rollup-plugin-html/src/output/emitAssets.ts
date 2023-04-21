import { PluginContext } from 'rollup';
import path from 'path';

import { InputAsset, InputData } from '../input/InputData';
import { RollupPluginHTMLOptions, TransformAssetFunction } from '../RollupPluginHTMLOptions';

export interface EmittedAssets {
  static: Map<string, string>;
  hashed: Map<string, string>;
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
      if (asset.hashed) {
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
