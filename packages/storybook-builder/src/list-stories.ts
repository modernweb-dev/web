// based on https://github.com/storybookjs/storybook/blob/v8.5.0/code/builders/builder-vite/src/list-stories.ts

import { normalizeStories } from '@storybook/core-common';
import type { Options } from '@storybook/types';
import { glob } from 'glob';
import { isAbsolute, join } from 'node:path';

const excludeNodeModulesGlobOptions = (glob: string) =>
  /node_modules/.test(glob) ? {} : { ignore: ['**/node_modules/**'] };

export async function listStories(options: Options) {
  const slash = (await import('slash')).default; // for CJS compatibility

  return (
    await Promise.all(
      normalizeStories(await options.presets.apply('stories', [], options), {
        configDir: options.configDir,
        workingDir: options.configDir,
      }).map(({ directory, files }) => {
        const pattern = join(directory, files);
        const absolutePattern = isAbsolute(pattern) ? pattern : join(options.configDir, pattern);

        return glob(slash(absolutePattern), {
          ...excludeNodeModulesGlobOptions(absolutePattern),
          follow: true,
        });
      }),
    )
  )
    .reduce((carry, stories) => carry.concat(stories.map(slash)), [])
    .sort();
}
