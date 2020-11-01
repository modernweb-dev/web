import { injectBundles } from './injectBundles';
import { InputData } from '../input/InputData';
import {
  EntrypointBundle,
  RollupPluginHTMLOptions,
  TransformHtmlFunction,
} from '../RollupPluginHTMLOptions';
import { parse, serialize } from 'parse5';
import { injectedUpdatedAssetPaths } from './injectedUpdatedAssetPaths';

export interface GetOutputHTMLParams {
  input: InputData;
  outputDir: string;
  assetPaths: Map<string, string>;
  pluginOptions: RollupPluginHTMLOptions;
  entrypointBundles: Record<string, EntrypointBundle>;
  externalTransformHtmlFns?: TransformHtmlFunction[];
}

export async function getOutputHTML(params: GetOutputHTMLParams) {
  const {
    pluginOptions,
    entrypointBundles,
    externalTransformHtmlFns,
    input,
    outputDir,
    assetPaths,
  } = params;
  const { default: defaultBundle, ...multiBundles } = entrypointBundles;
  const rootDir = pluginOptions.rootDir ?? process.cwd();

  // inject rollup output into HTML
  const document = parse(input.html);
  if (pluginOptions.extractAssets !== false) {
    injectedUpdatedAssetPaths({ document, input, outputDir, rootDir, assetPaths });
  }
  injectBundles(document, entrypointBundles);

  let outputHtml = serialize(document);

  const transforms = [...(externalTransformHtmlFns ?? [])];
  if (pluginOptions.transformHtml) {
    if (Array.isArray(pluginOptions.transformHtml)) {
      transforms.push(...pluginOptions.transformHtml);
    } else {
      transforms.push(pluginOptions.transformHtml);
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
