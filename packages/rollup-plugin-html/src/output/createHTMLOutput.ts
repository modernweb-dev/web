import { getEntrypointBundles } from './getEntrypointBundles.ts';
import { getOutputHTML } from './getOutputHTML.ts';
import { createError } from '../utils.ts';
import type {
  GeneratedBundle,
  RollupPluginHTMLOptions,
  TransformHtmlFunction,
} from '../RollupPluginHTMLOptions.ts';
import type { EmittedFile } from 'rollup';
import type { InputData } from '../input/InputData.ts';
import type { EmittedAssets } from './emitAssets.ts';

export interface CreateHTMLAssetParams {
  outputDir: string;
  input: InputData;
  emittedAssets: EmittedAssets;
  generatedBundles: GeneratedBundle[];
  inputExternalTransformHtmlFns: TransformHtmlFunction[];
  outputExternalTransformHtmlFns: TransformHtmlFunction[];
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
    inputExternalTransformHtmlFns,
    outputExternalTransformHtmlFns,
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
    inputExternalTransformHtmlFns,
    outputExternalTransformHtmlFns,
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
  inputExternalTransformHtmlFns: TransformHtmlFunction[];
  outputExternalTransformHtmlFns: TransformHtmlFunction[];
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
