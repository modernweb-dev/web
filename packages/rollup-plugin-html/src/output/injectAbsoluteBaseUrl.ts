import { Node, Document } from 'parse5';
import { findElements, getTagName, getAttribute, setAttribute } from '@web/parse5-utils';

function isAbsoluteableNode(node: Node) {
  const metaAttributes = ['og:url', 'og:image'];
  switch (getTagName(node)) {
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
  const nodes = findElements(document, isAbsoluteableNode);
  for (const node of nodes) {
    switch (getTagName(node)) {
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
