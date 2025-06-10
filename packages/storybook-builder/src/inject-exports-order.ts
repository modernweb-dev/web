// based on https://github.com/modernweb-dev/web/blob/%40web/dev-server-storybook%400.7.1/packages/dev-server-storybook/src/shared/stories/injectExportsOrder.ts

import { parse } from 'es-module-lexer';

export async function injectExportsOrder(source: string, filePath: string) {
  const [, exports] = await parse(source, filePath);
  if (exports.some(e => e.n === '__namedExportsOrder')) {
    // user has defined named exports already
    return null;
  }

  const orderedExports = exports.filter(e => e.n !== 'default');
  const exportsArray = `['${orderedExports.map(({ n }) => n).join("', '")}']`;

  return `${source};\nexport const __namedExportsOrder = ${exportsArray};`;
}
