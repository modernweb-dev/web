import { getEntrypointBundles } from './getEntrypointBundles.js';
import { getOutputHTML } from './getOutputHTML.js';
import { createError } from '../utils.js';
import {
  GeneratedBundle,
  RollupPluginHTMLOptions,
  TransformHtmlFunction,
} from '../RollupPluginHTMLOptions.js';
import { EmittedFile } from 'rollup';
import { InputData } from '../input/InputData.js';
import { EmittedAssets } from './emitAssets.js';

export interface CreateHTMLAssetParams {
  outputDir: string;
  input: InputData;
  emittedAssets: EmittedAssets;
  generatedBundles: GeneratedBundle[];
  externalTransformHtmlFns: TransformHtmlFunction[];
  pluginOptions: RollupPluginHTMLOptions;
  defaultInjectDisabled: boolean;
  serviceWorkerPath: string;
  injectServiceWorker: boolean;
  absolutePathPrefix?: string;
  strictCSPInlineScripts: boolean;
}

export async function createHTMLAsset(params: CreateHTMLAssetParams): Promise<EmittedFile> {
  const {
    outputDir,
    input,
    emittedAssets,
    generatedBundles,
    externalTransformHtmlFns,
    pluginOptions,
    defaultInjectDisabled,
    serviceWorkerPath,
    injectServiceWorker,
    absolutePathPrefix,
    strictCSPInlineScripts,
  } = params;

  if (generatedBundles.length === 0) {
    throw createError('Cannot output HTML when no bundles have been generated');
  }

  const entrypointBundles = getEntrypointBundles({
    pluginOptions,
    generatedBundles,
    inputModuleIds: input.moduleImports,
    outputDir,
    htmlFileName: input.name,
  });

  const outputHtml = await getOutputHTML({
    pluginOptions,
    entrypointBundles,
    input,
    outputDir,
    emittedAssets,
    externalTransformHtmlFns,
    defaultInjectDisabled,
    serviceWorkerPath,
    injectServiceWorker,
    absolutePathPrefix,
    strictCSPInlineScripts,
  });

  return { fileName: input.name, name: input.name, source: outputHtml, type: 'asset' };
}

export interface CreateHTMLAssetsParams {
  outputDir: string;
  inputs: InputData[];
  emittedAssets: EmittedAssets;
  generatedBundles: GeneratedBundle[];
  externalTransformHtmlFns: TransformHtmlFunction[];
  pluginOptions: RollupPluginHTMLOptions;
  defaultInjectDisabled: boolean;
  serviceWorkerPath: string;
  injectServiceWorker: boolean;
  absolutePathPrefix?: string;
  strictCSPInlineScripts: boolean;
}

export async function createHTMLOutput(params: CreateHTMLAssetsParams): Promise<EmittedFile[]> {
  return Promise.all(params.inputs.map(input => createHTMLAsset({ ...params, input })));
}
