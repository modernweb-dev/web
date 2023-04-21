import {
  rollup,
  InputOptions,
  NormalizedInputOptions,
  PluginContext,
  TransformPluginContext,
  MinimalPluginContext,
} from 'rollup';

export interface RollupPluginContexts {
  normalizedInputOptions: NormalizedInputOptions;
  pluginContext: PluginContext;
  minimalPluginContext: MinimalPluginContext;
  transformPluginContext: TransformPluginContext;
}

/**
 * Runs rollup with an empty module in order to capture the plugin context and
 * normalized options.
 * @param inputOptions
 */
export async function createRollupPluginContexts(
  inputOptions: InputOptions,
): Promise<RollupPluginContexts> {
  let normalizedInputOptions: NormalizedInputOptions | undefined = undefined;
  let pluginContext: PluginContext | undefined = undefined;
  let transformPluginContext: TransformPluginContext | undefined = undefined;

  await rollup({
    ...inputOptions,

    input: 'noop',

    plugins: [
      {
        name: 'noop',
        buildStart(options) {
          normalizedInputOptions = options;
        },
        resolveId(id) {
          pluginContext = this; // eslint-disable-line @typescript-eslint/no-this-alias
          return id;
        },
        load() {
          return '';
        },
        transform() {
          transformPluginContext = this; // eslint-disable-line @typescript-eslint/no-this-alias
          return null;
        },
      },
    ],
  });

  if (!normalizedInputOptions || !pluginContext || !transformPluginContext) {
    throw new TypeError();
  }

  return {
    normalizedInputOptions,
    pluginContext,
    transformPluginContext,
    minimalPluginContext: { meta: (pluginContext as PluginContext).meta },
  };
}
