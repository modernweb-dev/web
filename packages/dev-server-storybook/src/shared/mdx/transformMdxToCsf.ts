import mdx from '@mdx-js/mdx';
import { transformAsync } from '@babel/core';
import createCompiler from './mdx-compiler-plugin';
import { createError } from '../utils';

const compilers = [createCompiler({})];

export async function transformMdxToCsf(body: string, filePath: string): Promise<string> {
  // turn MDX to JSX
  const jsx = `
      import { React, mdx } from '@web/storybook-prebuilt/web-components.js';

      ${await mdx(body, { compilers, filepath: filePath })}
    `;

  // turn JSX to JS
  const babelResult = await transformAsync(jsx, {
    filename: filePath,
    sourceMaps: true,
    plugins: [require.resolve('@babel/plugin-transform-react-jsx')],
  });

  if (!babelResult?.code) {
    throw createError(`Something went wrong while transforming ${filePath}`);
  }

  // rewrite imports
  const result = babelResult.code.replace(
    /@storybook\/addon-docs\/blocks/g,
    '@web/storybook-prebuilt/addon-docs/blocks.js',
  );
  return result;
}
