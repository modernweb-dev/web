import { PluginContext } from 'rollup';
import path from 'path';

import { InputData } from '../input/InputData';
import { RollupPluginHTMLOptions, TransformAssetFunction } from '../RollupPluginHTMLOptions';

export async function emitAssets(
  this: PluginContext,
  inputs: InputData[],
  options: RollupPluginHTMLOptions,
) {
  const outputAssets = new Map<string, string>();

  const transforms: TransformAssetFunction[] = [];
  if (options.transformAsset) {
    if (Array.isArray(options.transformAsset)) {
      transforms.push(...options.transformAsset);
    } else {
      transforms.push(options.transformAsset);
    }
  }

  for (const input of inputs) {
    for (const asset of input.assets) {
      if (!outputAssets.has(asset.filePath)) {
        const name = path.basename(asset.filePath);
        let source: Buffer = asset.content;

        // run user's transform functions
        for (const transform of transforms) {
          const result = await transform(asset.content, asset.filePath);
          if (result != null) {
            source = typeof result === 'string' ? Buffer.from(result, 'utf-8') : result;
          }
        }

        const ref = this.emitFile({ type: 'asset', name, source });
        outputAssets.set(asset.filePath, this.getFileName(ref));
      }
    }
  }

  return outputAssets;
}
