import { injectBundles } from './injectBundles';
import { InputHTMLData } from '../input/InputHTMLData';
import {
  EntrypointBundle,
  RollupPluginHTMLOptions,
  TransformFunction,
} from '../RollupPluginHTMLOptions';

export interface GetOutputHTMLParams {
  input: InputHTMLData;
  pluginOptions: RollupPluginHTMLOptions;
  entrypointBundles: Record<string, EntrypointBundle>;
  externalTransformFns?: TransformFunction[];
}

export async function getOutputHTML(params: GetOutputHTMLParams) {
  const { pluginOptions, entrypointBundles, externalTransformFns, input } = params;
  const { default: defaultBundle, ...multiBundles } = entrypointBundles;

  // inject rollup output into HTML
  let outputHtml = injectBundles(input.html, entrypointBundles);

  const transforms = [...(externalTransformFns ?? [])];
  if (pluginOptions.transform) {
    if (Array.isArray(pluginOptions.transform)) {
      transforms.push(...pluginOptions.transform);
    } else {
      transforms.push(pluginOptions.transform);
    }
  }

  // run transform functions on output HTML
  for (const transform of transforms) {
    outputHtml = await transform(outputHtml, {
      bundle: defaultBundle,
      bundles: multiBundles,
      htmlFileName: input.name,
    });
  }

  return outputHtml;
}
