import { injectBundles } from './injectBundles.js';
import { InputData } from '../input/InputData';
import {
  EntrypointBundle,
  RollupPluginHTMLOptions,
  TransformHtmlFunction,
} from '../RollupPluginHTMLOptions';
import { parse, serialize } from 'parse5';
import { minify as minifyHTMLFunc } from 'html-minifier-terser';
import { injectedUpdatedAssetPaths } from './injectedUpdatedAssetPaths.js';
import { EmittedAssets } from './emitAssets.js';
import { injectAbsoluteBaseUrl } from './injectAbsoluteBaseUrl.js';
import { hashInlineScripts } from './hashInlineScripts.js';
import { injectServiceWorkerRegistration } from './injectServiceWorkerRegistration.js';

export interface GetOutputHTMLParams {
  input: InputData;
  outputDir: string;
  emittedAssets: EmittedAssets;
  pluginOptions: RollupPluginHTMLOptions;
  entrypointBundles: Record<string, EntrypointBundle>;
  externalTransformHtmlFns?: TransformHtmlFunction[];
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
    externalTransformHtmlFns,
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

  // inject rollup output into HTML
  let document = parse(input.html);
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
