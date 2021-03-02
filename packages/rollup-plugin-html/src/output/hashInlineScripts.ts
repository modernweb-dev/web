import { Node, Document } from 'parse5';
import {
  findElements,
  getTagName,
  hasAttribute,
  getTextContent,
  createElement,
  findNode,
  prepend,
} from '@web/parse5-utils';
import crypto from 'crypto';

function isInlineScript(node: Node) {
  if (getTagName(node) === 'script' && !hasAttribute(node, 'src')) {
    return true;
  }
  return false;
}

function injectCSPMetaTag(document: Document, hashes: string[]) {
  const metaTag = createElement('meta', {
    'http-equiv': 'Content-Security-Policy',
    content: `script-src 'self' ${hashes.join(' ')}`,
  });
  const head = findNode(document, node => node.nodeName === 'head');
  if (head) {
    prepend(head, metaTag);
  }
}

export function hashInlineScripts(document: Document) {
  const nodes = findElements(document, isInlineScript);
  const hashes: string[] = [];
  nodes.forEach(node => {
    if (node.childNodes[0]) {
      const scriptContent = getTextContent(node.childNodes[0]);
      const hash = crypto.createHash('sha256').update(scriptContent).digest('base64');
      hashes.push(`'sha256-${hash}'`);
    }
  });
  if (hashes.length > 0) {
    injectCSPMetaTag(document, hashes);
  }
}
