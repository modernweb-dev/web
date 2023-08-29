import type { Options } from '@storybook/types';
import type { Plugin } from 'rollup';
import { generateAppScript } from './generate-app-script';
import { generateSetupAddonsScript } from './generate-setup-addons-script';
import { generateStoriesScript } from './generate-stories-script';
import { injectExportsOrder } from './inject-exports-order';
import { listStories } from './list-stories';
import {
  virtualAppFilename,
  virtualSetupAddonsFilename,
  virtualStoriesFilename,
} from './virtual-file-names';

export function rollupPluginStorybookBuilder(storybookOptions: Options): Plugin {
  let storyFilePaths: string[];

  return {
    name: 'rollup-plugin-storybook-builder',

    async buildStart() {
      storyFilePaths = await listStories(storybookOptions);
    },

    async resolveId(source) {
      if (source === virtualAppFilename) {
        return './' + source;
      }

      if (source === virtualSetupAddonsFilename) {
        return './' + source;
      }

      if (source === virtualStoriesFilename) {
        return './' + source;
      }
    },

    async load(id) {
      if (id.endsWith(virtualAppFilename)) {
        return generateAppScript(storybookOptions);
      }

      if (id.endsWith(virtualSetupAddonsFilename)) {
        return generateSetupAddonsScript();
      }

      if (id.endsWith(virtualStoriesFilename)) {
        return generateStoriesScript(storybookOptions);
      }
    },

    async transform(code, id) {
      if (storyFilePaths.includes(id)) {
        // inject story order
        return injectExportsOrder(code, id);
      }
    },
  };
}
