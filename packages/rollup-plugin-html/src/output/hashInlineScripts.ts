import { Document, Element, ParentNode } from 'parse5';
import {
  findElement,
  findElements,
  getTagName,
  hasAttribute,
  getAttribute,
  getTextContent,
  createElement,
  findNode,
  prepend,
  setAttribute,
} from '@web/parse5-utils';
import crypto from 'crypto';

function isMetaCSPTag(node: Element) {
  if (
    getTagName(node) === 'meta' &&
    getAttribute(node, 'http-equiv') === 'Content-Security-Policy'
  ) {
    return true;
  }
  return false;
}

function isInlineScript(node: Element) {
  if (getTagName(node) === 'script' && !hasAttribute(node, 'src')) {
    return true;
  }
  return false;
}

/**
 * Parses Meta CSP Content string as an object so we can easily mutate it in JS
 * E.g.:
 *
 * "default-src 'self'; prefetch-src 'self'; upgrade-insecure-requests; style-src 'self' 'unsafe-inline';"
 *
 * becomes
 *
 * {
 *   'default-src': ["'self'"],
 *   'prefetch-src': ["'self'"],
 *   'upgrade-insecure-requests': [],
 *   'style-src': ["'self'", "'unsafe-inline'"]
 * }
 *
 */
function parseMetaCSPContent(content: string): { [key: string]: string[] } {
  return content.split(';').reduce((acc, curr) => {
    const trimmed = curr.trim();
    if (!trimmed) {
      return acc;
    }
    const splitItem = trimmed.split(' ');
    const [, ...values] = splitItem;
    return {
      ...acc,
      [splitItem[0]]: values,
    };
  }, {});
}

/**
 * Serializes
 *
 * {
 *   'default-src': ["'self'"],
 *   'prefetch-src': ["'self'"],
 *   'upgrade-insecure-requests': [],
 *   'style-src': ["'self'", "'unsafe-inline'"]
 * }
 *
 * back to
 *
 * "default-src 'self'; prefetch-src 'self'; upgrade-insecure-requests; style-src 'self' 'unsafe-inline';"
 */
function serializeMetaCSPContent(data: { [key: string]: string[] }): string {
  const dataEntries = Object.entries(data);
  return dataEntries.reduce((accOuter, currOuter, indexOuter) => {
    let suffixOuter = ' ';
    let sep = ' ';

    // If there are no items for this key
    if (currOuter[1].length === 0) {
      suffixOuter = '; ';
      sep = '';
    }

    // Don't insert space suffix when it is the last item
    if (indexOuter === dataEntries.length - 1) {
      suffixOuter = '';
    }

    return `${accOuter}${currOuter[0]}${sep}${currOuter[1].reduce(
      (accInner, currInner, indexInner) => {
        let suffixInner = ' ';
        if (indexInner === currOuter[1].length - 1) {
          suffixInner = ';';
        }
        return `${accInner}${currInner}${suffixInner}`;
      },
      '',
    )}${suffixOuter}`;
  }, '');
}

function injectCSPScriptRules(metaCSPEl: Element, hashes: string[]) {
  const content = getAttribute(metaCSPEl, 'content');
  if (content) {
    const data = parseMetaCSPContent(content);

    if (Array.isArray(data['script-src'])) {
      data['script-src'].push(...hashes);
    } else {
      data['script-src'] = ["'self'", ...hashes];
    }

    const newContent = serializeMetaCSPContent(data);
    setAttribute(metaCSPEl, 'content', newContent);
  }
}

function injectCSPMetaTag(document: Document, hashes: string[]) {
  const metaTag = createElement('meta', {
    'http-equiv': 'Content-Security-Policy',
    content: `script-src 'self' ${hashes.join(' ')};`,
  });
  const head = findNode(document, node => node.nodeName === 'head');
  if (head) {
    prepend(head as ParentNode, metaTag);
  }
}

export function hashInlineScripts(document: Document) {
  const metaCSPEl = findElement(document, isMetaCSPTag);
  const inlineScripts = findElements(document, isInlineScript);
  const hashes: string[] = [];
  inlineScripts.forEach(node => {
    if (node.childNodes[0]) {
      const scriptContent = getTextContent(node.childNodes[0]);
      const hash = crypto.createHash('sha256').update(scriptContent).digest('base64');
      hashes.push(`'sha256-${hash}'`);
    }
  });
  if (hashes.length > 0) {
    if (metaCSPEl) {
      injectCSPScriptRules(metaCSPEl, hashes);
    } else {
      injectCSPMetaTag(document, hashes);
    }
  }
}
