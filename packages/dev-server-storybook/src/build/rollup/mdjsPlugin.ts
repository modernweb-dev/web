import { Plugin } from 'rollup';
import { mdjsToCsf } from 'storybook-addon-markdown-docs';

export function mdjsPlugin(type: string): Plugin {
  return {
    name: 'md',
    transform(code, id) {
      if (id.endsWith('.md')) {
        return mdjsToCsf(code, id, type);
      }
    },
  };
}
