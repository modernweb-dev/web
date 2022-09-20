import { Document, Element, Node } from 'parse5/dist/tree-adapters/default';
import { queryAll, getAttribute, setAttribute, isElementNode } from '@parse5/tools';

function isAbsoluteableNode(node: Node) {
  if (!isElementNode(node)) {
    return false;
  }

  const metaAttributes = ['og:url', 'og:image'];
  switch (node.tagName) {
    case 'link':
      if (getAttribute(node, 'rel') === 'canonical' && getAttribute(node, 'href')) {
        return true;
      }
      return false;
    case 'meta':
      if (
        metaAttributes.includes(getAttribute(node, 'property')!) &&
        getAttribute(node, 'content')
      ) {
        return true;
      }
      return false;
    default:
      return false;
  }
}

export function injectAbsoluteBaseUrl(document: Document, absoluteBaseUrl: string) {
  const nodes = [...queryAll<Element>(document, isAbsoluteableNode)];
  for (const node of nodes) {
    switch (node.tagName) {
      case 'link':
        setAttribute(node, 'href', new URL(getAttribute(node, 'href')!, absoluteBaseUrl).href);
        break;
      case 'meta':
        setAttribute(
          node,
          'content',
          new URL(getAttribute(node, 'content')!, absoluteBaseUrl).href,
        );
        break;
    }
  }
}
