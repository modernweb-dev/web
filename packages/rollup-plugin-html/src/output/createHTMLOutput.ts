import { getEntrypointBundles } from './getEntrypointBundles';
import { getOutputHTML } from './getOutputHTML';
import { createError } from '../utils';
import {
  GeneratedBundle,
  RollupPluginHTMLOptions,
  TransformFunction,
} from '../RollupPluginHTMLOptions';
import { EmittedFile } from 'rollup';
import { InputHTMLData } from '../input/InputHTMLData';

export interface CreateHTMLAssetParams {
  outputDir: string;
  input: InputHTMLData;
  generatedBundles: GeneratedBundle[];
  externalTransformFns: TransformFunction[];
  pluginOptions: RollupPluginHTMLOptions;
}

export async function createHTMLAsset(params: CreateHTMLAssetParams): Promise<EmittedFile> {
  const { outputDir, input, generatedBundles, externalTransformFns, pluginOptions } = params;

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
    externalTransformFns,
  });

  return { fileName: input.name, source: outputHtml, type: 'asset' };
}

export interface CreateHTMLAssetsParams {
  outputDir: string;
  inputs: InputHTMLData[];
  generatedBundles: GeneratedBundle[];
  externalTransformFns: TransformFunction[];
  pluginOptions: RollupPluginHTMLOptions;
}

export async function createHTMLOutput(params: CreateHTMLAssetsParams): Promise<EmittedFile[]> {
  return Promise.all(params.inputs.map(input => createHTMLAsset({ ...params, input })));
}
