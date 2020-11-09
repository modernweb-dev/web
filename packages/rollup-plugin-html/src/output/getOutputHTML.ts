import { injectBundles } from './injectBundles';
import { InputData } from '../input/InputData';
import {
  EntrypointBundle,
  RollupPluginHTMLOptions,
  TransformHtmlFunction,
} from '../RollupPluginHTMLOptions';
import { parse, serialize } from 'parse5';
import { injectedUpdatedAssetPaths } from './injectedUpdatedAssetPaths';
import { EmittedAssets } from './emitAssets';
import { injectAbsoluteBaseUrl } from './injectAbsoluteBaseUrl';

export interface GetOutputHTMLParams {
  input: InputData;
  outputDir: string;
  emittedAssets: EmittedAssets;
  pluginOptions: RollupPluginHTMLOptions;
  entrypointBundles: Record<string, EntrypointBundle>;
  externalTransformHtmlFns?: TransformHtmlFunction[];
  defaultInjectDisabled: boolean;
}

export async function getOutputHTML(params: GetOutputHTMLParams) {
  const {
    pluginOptions,
    entrypointBundles,
    externalTransformHtmlFns,
    input,
    outputDir,
    emittedAssets,
    defaultInjectDisabled,
  } = params;
  const { default: defaultBundle, ...multiBundles } = entrypointBundles;
  const { absoluteSocialMediaUrls = true, rootDir = process.cwd() } = pluginOptions;

  // inject rollup output into HTML
  const document = parse(input.html);
  if (pluginOptions.extractAssets !== false) {
    injectedUpdatedAssetPaths({ document, input, outputDir, rootDir, emittedAssets });
  }
  if (!defaultInjectDisabled) {
    injectBundles(document, entrypointBundles);
  }
  if (absoluteSocialMediaUrls && pluginOptions.absoluteBaseUrl) {
    injectAbsoluteBaseUrl(document, pluginOptions.absoluteBaseUrl);
  }

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
