import { isUri } from 'valid-url';
import { Document as DocumentAst, Node as NodeAst } from 'parse5';
import { queryAll, predicates, getAttribute, hasAttribute } from '@web/dev-server-core/dist/dom5';

function isDeferred(script: NodeAst) {
  return getAttribute(script, 'type') === 'module' || hasAttribute(script, 'defer');
}

function isAsync(script: NodeAst) {
  return hasAttribute(script, 'async');
}

function sortByLoadingPriority(a: NodeAst, b: NodeAst) {
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
  const allScripts = queryAll(document, predicates.hasTagName('script'));

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
