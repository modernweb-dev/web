import { EntrypointBundle } from '@web/rollup-plugin-html';
import { PolyfillsLoaderConfig, FileType, fileTypes } from '@web/polyfills-loader';
import { ModuleFormat } from 'rollup';

import { RollupPluginPolyfillsLoaderConfig } from './types';
import { createError } from './utils';

export function formatToFileType(format: ModuleFormat) {
  switch (format) {
    case 'es':
    case 'esm':
    case 'module':
      return fileTypes.MODULE;
    case 'system':
      return fileTypes.SYSTEMJS;
    default:
      return fileTypes.SCRIPT;
  }
}

function bundleNotFoundError(name: string) {
  return createError(`Could not find any @web/rollup-plugin-html output named ${name}.`);
}

function createEntrypoints(bundle: EntrypointBundle, filetype?: FileType) {
  if (!bundle.options.format) {
    throw createError('An output format must be configured');
  }
  const type = filetype || formatToFileType(bundle.options.format);
  const files = bundle.entrypoints.map(e => ({
    type,
    path: e.importPath,
    attributes: e.attributes,
  }));
  return { files };
}

function createLegacyEntrypoints(bundle: EntrypointBundle, test: string, fileType?: FileType) {
  return { ...createEntrypoints(bundle, fileType), test };
}

export function createPolyfillsLoaderConfig(
  pluginOptions: RollupPluginPolyfillsLoaderConfig,
  bundle: EntrypointBundle,
  bundles: Record<string, EntrypointBundle>,
): PolyfillsLoaderConfig {
  const { modernOutput, legacyOutput, polyfills } = pluginOptions;
  let modern;
  let legacy;

  // @web/rollup-plugin-html outputs `bundle` when there is a single output,
  // otherwise it outputs `bundles`
  if (bundle) {
    if (modernOutput && legacyOutput) {
      throw createError(
        'Options modernOutput and legacyOutput was set, but @web/rollup-plugin-html' +
          ` did not output multiple builds. Make sure you use html.api.addOutput('my-output') for each rollup output.`,
      );
    }

    modern = createEntrypoints(bundle, modernOutput?.type);
  } else {
    if (!bundles || Object.keys(bundles).length === 0) {
      throw createError('@web/rollup-plugin-html did not output any bundles to be injected');
    }

    if (!modernOutput || !legacyOutput) {
      throw createError(
        'Rollup is configured to output multiple builds, set the modernOutput and legacyOutput options' +
          ' to configure how they should be loaded by the polyfills loader.',
      );
    }

    if (!bundles[modernOutput.name]) throw bundleNotFoundError(modernOutput.name);
    modernOutput.type;
    modern = createEntrypoints(bundles[modernOutput.name], modernOutput.type);

    /** @type {LegacyEntrypoint[]} */
    legacy = [];
    const legacyOutputIterator = Array.isArray(legacyOutput) ? legacyOutput : [legacyOutput];
    for (const output of legacyOutputIterator) {
      if (!bundles[output.name]) throw bundleNotFoundError(output.name);

      const entrypoint = createLegacyEntrypoints(bundles[output.name], output.test, output.type);
      legacy.push(entrypoint);
    }
  }

  return { modern, legacy, polyfills, externalLoaderScript: pluginOptions.externalLoaderScript };
}
