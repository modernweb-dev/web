import { compile } from '@mdx-js/mdx';
import { transformAsync } from '@babel/core';
import { createError } from '../utils.js';

export async function transformMdxToCsf(body: string, filePath: string): Promise<string> {
  // turn MDX to JSX
  const jsx = `
      import { React, mdx } from '@web/storybook-prebuilt/web-components.js';

      ${await compile(body, { filepath: filePath })}
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
  let result = babelResult.code.replace(
    /@storybook\/addon-docs\/blocks/g,
    '@web/storybook-prebuilt/addon-docs/blocks.js',
  );
  result = result.replace(
    /@storybook\/addon-docs/g,
    '@web/storybook-prebuilt/addon-docs/blocks.js',
  );
  return result;
}
