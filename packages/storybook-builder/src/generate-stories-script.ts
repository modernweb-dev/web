// based on https://github.com/storybookjs/storybook/blob/v8.5.0/code/builders/builder-vite/src/codegen-importfn-script.ts

import { normalizePath } from '@rollup/pluginutils';
import type { Options } from '@storybook/types';
import { relative } from 'node:path';
import { listStories } from './list-stories';

export async function generateStoriesScript(options: Options): Promise<string> {
  // First we need to get an array of stories and their absolute paths.
  const stories = await listStories(options);

  // We can then call toImportFn to create a function that can be used to load each story dynamically.
  return await toImportFn(stories);
}

/**
 * This function takes an array of stories and creates a mapping between the stories' relative paths
 * to the working directory and their dynamic imports. The import is done in an asynchronous
 * function to delay loading and to allow rollup to split the code into smaller chunks. It then
 * creates a function, `importFn(path)`, which resolves a path to an import function and this is
 * called by Storybook to fetch a story dynamically when needed.
 *
 * @param stories An array of absolute story paths.
 */
async function toImportFn(stories: string[]) {
  const objectEntries = stories.map(file => {
    const relativePath = normalizePath(relative(process.cwd(), file));
    const importPath = toImportPath(relativePath);
    let actualPath = file;
    if (actualPath.endsWith('.mdx')) {
      actualPath = `${actualPath}.js`;
    }

    return `  '${importPath}': () => import('${actualPath}')`;
  });

  return `
const importers = {
${objectEntries.join(',\n')}
};

export function importFn(path) {
  return importers[path]();
}
  `.trim();
}

/**
 * Paths get passed either with no leading './' - e.g. `src/Foo.stories.js`,
 * or with a leading `../` (etc), e.g. `../src/Foo.stories.js`.
 * We want to deal in importPaths relative to the working dir, so we normalize
 */
function toImportPath(relativePath: string) {
  return relativePath.startsWith('../') ? relativePath : `./${relativePath}`;
}
