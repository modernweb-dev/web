import { getEntrypointBundles } from './getEntrypointBundles';
import { getOutputHTML } from './getOutputHTML';
import { createError } from '../utils';
import {
  GeneratedBundle,
  RollupPluginHTMLOptions,
  TransformHtmlFunction,
} from '../RollupPluginHTMLOptions';
import { EmittedFile } from 'rollup';
import { InputData } from '../input/InputData';
import { EmittedAssets } from './emitAssets';

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
}

export async function createHTMLOutput(params: CreateHTMLAssetsParams): Promise<EmittedFile[]> {
  return Promise.all(params.inputs.map(input => createHTMLAsset({ ...params, input })));
}
