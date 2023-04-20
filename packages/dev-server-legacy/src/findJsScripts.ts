import { isUri } from 'valid-url';
import { Document as DocumentAst, Element as ElementAst } from 'parse5/dist/tree-adapters/default';
import { queryAll, hasAttribute, getAttribute, isElementNode } from '@parse5/tools';

function isDeferred(script: ElementAst) {
  return getAttribute(script, 'type') === 'module' || hasAttribute(script, 'defer');
}

function isAsync(script: ElementAst) {
  return hasAttribute(script, 'async');
}

function sortByLoadingPriority(a: ElementAst, b: ElementAst) {
  if (isAsync(a)) {
    return 0;
  }

  const aDeferred = isDeferred(a);
  const bDeferred = isDeferred(b);

  if (aDeferred && bDeferred) {
    return 0;
  }

  if (aDeferred) {
    return 1;
  }

  if (bDeferred) {
    return -1;
  }

  return 0;
}

export function findJsScripts(document: DocumentAst) {
  const allScripts = [
    ...queryAll<ElementAst>(document, node => isElementNode(node) && node.tagName === 'script'),
  ];

  return allScripts
    .filter(script => {
      const inline = !hasAttribute(script, 'src');
      const type = getAttribute(script, 'type');

      // we don't handle scripts which import from a URL (ex. a CDN)
      if (!inline && isUri(getAttribute(script, 'src') ?? '')) {
        return false;
      }

      if (!type || ['application/javascript', 'text/javascript', 'module'].includes(type)) {
        return true;
      }
      return false;
    })
    .sort(sortByLoadingPriority);
}
