import type { Options } from '@storybook/types';
import type { Plugin } from 'rollup';
import { generateAppScript } from './generate-app-script.js';
import { generateSetupAddonsScript } from './generate-setup-addons-script.js';
import { generateStoriesScript } from './generate-stories-script.js';
import { injectExportsOrder } from './inject-exports-order.js';
import { listStories } from './list-stories.js';
import {
  virtualAppFilename,
  virtualSetupAddonsFilename,
  virtualStoriesFilename,
} from './virtual-file-names.js';

export function rollupPluginStorybookBuilder(options: Options): Plugin {
  let storyFilePaths: string[];

  return {
    name: 'rollup-plugin-storybook-builder',

    async buildStart() {
      storyFilePaths = await listStories(options);
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
        return generateAppScript(options);
      }

      if (id.endsWith(virtualSetupAddonsFilename)) {
        return generateSetupAddonsScript();
      }

      if (id.endsWith(virtualStoriesFilename)) {
        return generateStoriesScript(options);
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
