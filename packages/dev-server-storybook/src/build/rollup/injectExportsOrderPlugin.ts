import { Plugin } from 'rollup';
import { injectExportsOrder } from '../../shared/stories/injectExportsOrder';

export function injectExportsOrderPlugin(storyFilePaths: string[]): Plugin {
  return {
    name: 'mdx',
    transform(code, id) {
      if (storyFilePaths.includes(id)) {
        return injectExportsOrder(code, id);
      }
    },
  };
}
