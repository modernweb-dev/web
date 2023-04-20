import { Token } from 'parse5';
import { Document, Element } from 'parse5/dist/tree-adapters/default';
import { isElementNode, createElement, query, appendChild, setTextContent } from '@parse5/tools';

import { EntrypointBundle } from '../RollupPluginHTMLOptions';
import { createError } from '../utils';

export function createLoadScript(src: string, format: string, attributes?: Token.Attribute[]) {
  const attributesObject: Record<string, string> = {};
  if (attributes) {
    for (const attribute of attributes) {
      attributesObject[attribute.name] = attribute.value;
    }
  }
  if (['es', 'esm', 'module'].includes(format)) {
    return createElement('script', {
      src,
      type: 'module',
      ...attributesObject,
    });
  }

  if (['system', 'systemjs'].includes(format)) {
    const script = createElement('script');
    setTextContent(script, `System.import(${JSON.stringify(src)});`);
    return script;
  }

  return createElement('script', { src, defer: '' });
}

export function injectBundles(
  document: Document,
  entrypointBundles: Record<string, EntrypointBundle>,
) {
  const body = query<Element>(document, e => isElementNode(e) && e.tagName === 'body');
  if (!body) {
    throw new Error('Missing body in HTML document.');
  }

  for (const { options, entrypoints } of Object.values(entrypointBundles)) {
    if (!options.format) throw createError('Missing output format.');

    for (const entrypoint of entrypoints) {
      appendChild(
        body,
        createLoadScript(entrypoint.importPath, options.format, entrypoint.attributes),
      );
    }
  }
}
