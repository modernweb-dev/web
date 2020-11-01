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

export interface CreateHTMLAssetParams {
  outputDir: string;
  input: InputData;
  assetPaths: Map<string, string>;
  generatedBundles: GeneratedBundle[];
  externalTransformHtmlFns: TransformHtmlFunction[];
  pluginOptions: RollupPluginHTMLOptions;
}

export async function createHTMLAsset(params: CreateHTMLAssetParams): Promise<EmittedFile> {
  const {
    outputDir,
    input,
    assetPaths,
    generatedBundles,
    externalTransformHtmlFns,
    pluginOptions,
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
    assetPaths,
    externalTransformHtmlFns,
  });

  return { fileName: input.name, name: input.name, source: outputHtml, type: 'asset' };
}

export interface CreateHTMLAssetsParams {
  outputDir: string;
  inputs: InputData[];
  assetPaths: Map<string, string>;
  generatedBundles: GeneratedBundle[];
  externalTransformHtmlFns: TransformHtmlFunction[];
  pluginOptions: RollupPluginHTMLOptions;
}

export async function createHTMLOutput(params: CreateHTMLAssetsParams): Promise<EmittedFile[]> {
  return Promise.all(params.inputs.map(input => createHTMLAsset({ ...params, input })));
}
