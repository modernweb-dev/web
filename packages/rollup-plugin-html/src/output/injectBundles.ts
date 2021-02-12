import { Document } from 'parse5';
import { createScript, findElement, getTagName, appendChild } from '@web/parse5-utils';

import { EntrypointBundle } from '../RollupPluginHTMLOptions';
import { createError } from '../utils';

export function createLoadScript(src: string, format: string) {
  if (['es', 'esm', 'module'].includes(format)) {
    return createScript({ type: 'module', src });
  }

  if (['system', 'systemjs'].includes(format)) {
    return createScript({}, `System.import(${JSON.stringify(src)});`);
  }

  return createScript({ src, defer: '' });
}

export function injectBundles(
  document: Document,
  entrypointBundles: Record<string, EntrypointBundle>,
) {
  const body = findElement(document, e => getTagName(e) === 'body');
  if (!body) {
    throw new Error('Missing body in HTML document.');
  }

  for (const { options, entrypoints } of Object.values(entrypointBundles)) {
    if (!options.format) throw createError('Missing output format.');

    for (const entrypoint of entrypoints) {
      appendChild(body, createLoadScript(entrypoint.importPath, options.format));
    }
  }
}
