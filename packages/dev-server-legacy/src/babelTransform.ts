import { transformAsync, TransformOptions } from '@babel/core';

export const es5Config: TransformOptions = {
  caller: {
    name: '@web/dev-server-legacy',
    supportsStaticESM: true,
  },
  sourceType: 'module',
  babelrc: false,
  configFile: false,
  presets: [
    [
      require.resolve('@babel/preset-env'),
      {
        targets: ['defaults', 'ie 10'],
        useBuiltIns: false,
        shippedProposals: true,
        modules: false,
        bugfixes: true,
      },
    ],
  ],
  /**
   * Enable syntax plugins for stage 3 features. This does **not** transform them,
   * it only ensures that babel does not crash when you're using them.
   */
  plugins: [
    require.resolve('@babel/plugin-syntax-import-meta'),
    require.resolve('@babel/plugin-syntax-class-properties'),
    require.resolve('@babel/plugin-syntax-numeric-separator'),
    require.resolve('@babel/plugin-syntax-dynamic-import'),
  ],
};

export const systemJsConfig: TransformOptions = {
  ...es5Config,
  plugins: [
    ...(es5Config.plugins ?? []),
    require.resolve('@babel/plugin-proposal-dynamic-import'),
    require.resolve('@babel/plugin-transform-modules-systemjs'),
    // systemjs adds template literals, we do systemjs after (potential)
    // es5 compilation so we need to ensure it stays es5
    require.resolve('@babel/plugin-transform-template-literals'),
  ],
};

export async function babelTransform(filename: string, source: string, config: TransformOptions) {
  const largeFile = source.length > 100000;
  const result = await transformAsync(source, {
    filename,
    // prevent generating pretty output for large files
    compact: largeFile,
    // babel runs out of memory when processing source maps andfor large files
    sourceMaps: !largeFile,
    ...config,
  });
  if (!result || typeof result.code !== 'string') {
    throw new Error('Failed to transform');
  }
  return result.code;
}
