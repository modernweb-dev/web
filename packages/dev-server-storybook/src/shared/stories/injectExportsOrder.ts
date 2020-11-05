import { parse } from 'es-module-lexer';

export async function injectExportsOrder(source: string, filePath: string) {
  const [, exports] = await parse(source, filePath);
  if (exports.includes('__namedExportsOrder')) {
    // user has defined named exports already
    return null;
  }

  const orderedExports = exports.filter(e => e !== 'default');
  const exportsArray = `['${orderedExports.join("', '")}']`;

  return `${source};\nexport const __namedExportsOrder = ${exportsArray};`;
}
