import { Plugin } from 'rollup';
import { transformMdxToCsf } from '../../shared/mdx/transformMdxToCsf';

export function mdxPlugin(): Plugin {
  return {
    name: 'mdx',
    transform(code, id) {
      if (id.endsWith('.mdx')) {
        return transformMdxToCsf(code, id);
      }
    },
  };
}
