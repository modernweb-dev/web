import { transformAsync, TransformOptions } from '@babel/core';

export async function es5Config(): Promise<TransformOptions> {
  if (!import.meta.resolve) {
    throw new Error('import.meta.resolve was not set');
  }

  return {
    caller: {
      name: '@web/dev-server-legacy',
      supportsStaticESM: true,
    },
    sourceType: 'module',
    babelrc: false,
    configFile: false,
    presets: [
      [
        await import.meta.resolve('@babel/preset-env'),
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
      await import.meta.resolve('@babel/plugin-syntax-import-meta'),
      await import.meta.resolve('@babel/plugin-syntax-class-properties'),
      await import.meta.resolve('@babel/plugin-syntax-numeric-separator'),
      await import.meta.resolve('@babel/plugin-syntax-dynamic-import'),
    ],
  };
}

export async function systemJsConfig(): Promise<TransformOptions> {
  if (!import.meta.resolve) {
    throw new Error('import.meta.resolve was not set');
  }

  const es5 = await es5Config();

  return {
    ...es5,
    plugins: [
      ...(es5.plugins ?? []),
      await import.meta.resolve('@babel/plugin-proposal-dynamic-import'),
      await import.meta.resolve('@babel/plugin-transform-modules-systemjs'),
      // systemjs adds template literals, we do systemjs after (potential)
      // es5 compilation so we need to ensure it stays es5
      await import.meta.resolve('@babel/plugin-transform-template-literals'),
    ],
  };
}

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
