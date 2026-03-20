import { injectBundles } from './injectBundles.ts';
import type { InputData } from '../input/InputData.ts';
import type {
  EntrypointBundle,
  RollupPluginHTMLOptions,
  TransformHtmlFunction,
} from '../RollupPluginHTMLOptions.ts';
import { parse, serialize } from 'parse5';
import { minify as minifyHTMLFunc } from 'html-minifier-terser';
import { injectedUpdatedAssetPaths } from './injectedUpdatedAssetPaths.ts';
import type { EmittedAssets } from './emitAssets.ts';
import { injectAbsoluteBaseUrl } from './injectAbsoluteBaseUrl.ts';
import { hashInlineScripts } from './hashInlineScripts.ts';
import { injectServiceWorkerRegistration } from './injectServiceWorkerRegistration.ts';

export interface GetOutputHTMLParams {
  input: InputData;
  outputDir: string;
  emittedAssets: EmittedAssets;
  pluginOptions: RollupPluginHTMLOptions;
  entrypointBundles: Record<string, EntrypointBundle>;
  inputExternalTransformHtmlFns?: TransformHtmlFunction[];
  outputExternalTransformHtmlFns?: TransformHtmlFunction[];
  defaultInjectDisabled: boolean;
  serviceWorkerPath: string;
  injectServiceWorker: boolean;
  absolutePathPrefix?: string;
  strictCSPInlineScripts: boolean;
}

export async function getOutputHTML(params: GetOutputHTMLParams) {
  const {
    pluginOptions,
    entrypointBundles,
    inputExternalTransformHtmlFns,
    outputExternalTransformHtmlFns,
    input,
    outputDir,
    emittedAssets,
    defaultInjectDisabled,
    serviceWorkerPath,
    injectServiceWorker,
    absolutePathPrefix,
    strictCSPInlineScripts,
  } = params;
  const { default: defaultBundle, ...multiBundles } = entrypointBundles;
  const { absoluteSocialMediaUrls = true, rootDir = process.cwd() } = pluginOptions;

  let inputHtml = input.html;

  // run transform functions on input HTML
  const inputTransforms = [...(inputExternalTransformHtmlFns ?? [])];
  for (const transform of inputTransforms) {
    inputHtml = await transform(inputHtml, {
      bundle: defaultBundle,
      bundles: multiBundles,
      htmlFileName: input.name,
    });
  }

  // inject rollup output into HTML
  let document = parse(inputHtml);
  if (pluginOptions.extractAssets !== false) {
    injectedUpdatedAssetPaths({
      document,
      input,
      outputDir,
      rootDir,
      emittedAssets,
      externalAssets: pluginOptions.externalAssets,
      absolutePathPrefix,
      publicPath: pluginOptions.publicPath,
    });
  }
  if (!defaultInjectDisabled) {
    injectBundles(document, entrypointBundles);
  }
  if (absoluteSocialMediaUrls && pluginOptions.absoluteBaseUrl) {
    injectAbsoluteBaseUrl(document, pluginOptions.absoluteBaseUrl);
  }
  if (injectServiceWorker && serviceWorkerPath) {
    injectServiceWorkerRegistration({
      document,
      outputDir,
      serviceWorkerPath,
      htmlFileName: input.name,
    });
  }

  let outputHtml = serialize(document);

  const outputTransforms = [...(outputExternalTransformHtmlFns ?? [])];
  if (pluginOptions.transformHtml) {
    if (Array.isArray(pluginOptions.transformHtml)) {
      outputTransforms.push(...pluginOptions.transformHtml);
    } else {
      outputTransforms.push(pluginOptions.transformHtml);
    }
  }

  // run transform functions on output HTML
  for (const transform of outputTransforms) {
    outputHtml = await transform(outputHtml, {
      bundle: defaultBundle,
      bundles: multiBundles,
      htmlFileName: input.name,
    });
  }

  if (pluginOptions.minify) {
    outputHtml = await minifyHTMLFunc(outputHtml, {
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      useShortDoctype: true,
      minifyCSS: true,
      minifyJS: true,
    });
  }

  if (strictCSPInlineScripts) {
    document = parse(outputHtml);
    hashInlineScripts(document);
    outputHtml = serialize(document);
  }

  return outputHtml;
}
