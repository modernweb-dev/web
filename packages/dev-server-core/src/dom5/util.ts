/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import { constructors } from './modification';
import { isCommentNode, isDocument, isDocumentFragment, isElement, isTextNode } from './predicates';
import { nodeWalkAll } from './walking';

/**
 * Return the text value of a node or element
 *
 * Equivalent to `node.textContent` in the browser
 */
export function getTextContent(node: any): string {
  if (isCommentNode(node)) {
    return node.data || '';
  }
  if (isTextNode(node)) {
    return node.value || '';
  }
  const subtree = nodeWalkAll(node, isTextNode);
  return subtree.map(getTextContent).join('');
}

/**
 * @returns The string value of attribute `name`, or `null`.
 */
export function getAttribute(element: any, name: string): string | null {
  const i = getAttributeIndex(element, name);
  if (i > -1) {
    return element.attrs[i].value;
  }
  return null;
}

export function getAttributeIndex(element: any, name: string): number {
  if (!element.attrs) {
    return -1;
  }
  const n = name.toLowerCase();
  for (let i = 0; i < element.attrs.length; i++) {
    if (element.attrs[i].name.toLowerCase() === n) {
      return i;
    }
  }
  return -1;
}

/**
 * @returns `true` iff [element] has the attribute [name], `false` otherwise.
 */
export function hasAttribute(element: any, name: string): boolean {
  return getAttributeIndex(element, name) !== -1;
}

export function setAttribute(element: any, name: string, value: string) {
  const i = getAttributeIndex(element, name);
  if (i > -1) {
    element.attrs[i].value = value;
  } else {
    element.attrs.push({ name: name, value: value });
  }
}

export function removeAttribute(element: any, name: string) {
  const i = getAttributeIndex(element, name);
  if (i > -1) {
    element.attrs.splice(i, 1);
  }
}

function collapseTextRange(parent: any, start: number, end: number) {
  if (!parent.childNodes) {
    return;
  }
  let text = '';
  for (let i = start; i <= end; i++) {
    text += getTextContent(parent.childNodes[i]);
  }
  parent.childNodes.splice(start, end - start + 1);
  if (text) {
    const tn = constructors.text(text);
    tn.parentNode = parent;
    parent.childNodes.splice(start, 0, tn);
  }
}

/**
 * Normalize the text inside an element
 *
 * Equivalent to `element.normalize()` in the browser
 * See https://developer.mozilla.org/en-US/docs/Web/API/Node/normalize
 */
export function normalize(node: any) {
  if (!(isElement(node) || isDocument(node) || isDocumentFragment(node))) {
    return;
  }
  if (!node.childNodes) {
    return;
  }
  let textRangeStart = -1;
  for (let i = node.childNodes.length - 1, n: any; i >= 0; i--) {
    n = node.childNodes[i];
    if (isTextNode(n)) {
      if (textRangeStart === -1) {
        textRangeStart = i;
      }
      if (i === 0) {
        // collapse leading text nodes
        collapseTextRange(node, 0, textRangeStart);
      }
    } else {
      // recurse
      normalize(n);
      // collapse the range after this node
      if (textRangeStart > -1) {
        collapseTextRange(node, i + 1, textRangeStart);
        textRangeStart = -1;
      }
    }
  }
}

/**
 * Set the text value of a node or element
 *
 * Equivalent to `node.textContent = value` in the browser
 */
export function setTextContent(node: any, value: string) {
  if (isCommentNode(node)) {
    node.data = value;
  } else if (isTextNode(node)) {
    node.value = value;
  } else {
    const tn = constructors.text(value);
    tn.parentNode = node;
    node.childNodes = [tn];
  }
}

export type GetChildNodes = (node: any) => Node[] | undefined;

export const defaultChildNodes = function defaultChildNodes(node: any) {
  return node.childNodes;
};
