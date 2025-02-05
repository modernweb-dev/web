// based on https://github.com/storybookjs/storybook/blob/v8.5.0/code/builders/builder-vite/src/list-stories.ts

import { normalizeStories } from '@storybook/core-common';
import type { Options } from '@storybook/types';
import { promise as glob } from 'glob-promise';
import { isAbsolute, join } from 'node:path';

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

        return glob(slash(absolutePattern), { follow: true });
      }),
    )
  ).reduce((carry, stories) => carry.concat(stories), []);
}
