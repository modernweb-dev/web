import type { DefaultTreeAdapterTypes, Token } from 'parse5';
import { defaultTreeAdapter as adapter, parse, parseFragment, serialize } from 'parse5';

export type Element = DefaultTreeAdapterTypes.Element;
export type Attribute = Token.Attribute;
export type Node = DefaultTreeAdapterTypes.Node;
export type ParentNode = DefaultTreeAdapterTypes.ParentNode;
export type ChildNode = DefaultTreeAdapterTypes.ChildNode;
export type CommentNode = DefaultTreeAdapterTypes.CommentNode;
export type TextNode = DefaultTreeAdapterTypes.TextNode;
export type Document = DefaultTreeAdapterTypes.Document;
export type DocumentFragment = DefaultTreeAdapterTypes.DocumentFragment;

const DEFAULT_NAMESPACE = 'http://www.w3.org/1999/xhtml';
const REGEXP_IS_HTML_DOCUMENT = /^\s*<(!doctype|html|head|body)\b/i;

/**
 * Creates an element node.
 */
function createElement(
  tagName: string,
  attrs: Record<string, string> = {},
  namespaceURI: string = DEFAULT_NAMESPACE,
): Element {
  const attrsArray: Attribute[] = Object.entries(attrs).map(([name, value]) => ({ name, value }));
  return adapter.createElement(tagName, namespaceURI as any, attrsArray as any);
}

/**
 * Creates a script element.
 */
function createScript(
  attrs: Record<string, string> = {},
  code: string | undefined = undefined,
): Element {
  const element = createElement('script', attrs);
  if (code) {
    setTextContent(element, code);
  }
  return element;
}

function isHtmlFragment(html: string): boolean {
  const htmlWithoutComments = html.replace(/<!--.*?-->/gs, '');
  return !REGEXP_IS_HTML_DOCUMENT.test(htmlWithoutComments);
}

function getAttributes(element: Element): Record<string, string> {
  const attrsArray = adapter.getAttrList(element) as any;
  const attrsObj: Record<string, string> = {};
  for (const e of attrsArray) {
    attrsObj[e.name] = e.value;
  }
  return attrsObj;
}

function getAttribute(element: Element, name: string): string | undefined {
  const attrList = adapter.getAttrList(element) as any;
  if (!attrList) {
    return undefined;
  }

  const attr = attrList.find((a: any) => a.name == name);
  if (attr) {
    return attr.value;
  }
}

function hasAttribute(element: Element, name: string): boolean {
  return getAttribute(element, name) != null;
}

function setAttribute(element: Element, name: string, value: string): void {
  const attrs = adapter.getAttrList(element) as any;
  const existing = attrs.find((a: any) => a.name === name);

  if (existing) {
    existing.value = value;
  } else {
    attrs.push({ name, value });
  }
}

function setAttributes(element: Element, attributes: Record<string, string | undefined>): void {
  for (const [name, value] of Object.entries(attributes)) {
    if (value !== undefined) {
      setAttribute(element, name, value);
    }
  }
}

function removeAttribute(element: Element, name: string): void {
  const attrs = adapter.getAttrList(element) as any;
  (element as any).attrs = attrs.filter((attr: any) => attr.name !== name);
}

function getTextContent(node: Node): string {
  if (adapter.isCommentNode(node)) {
    return (node as CommentNode).data || '';
  }
  if (adapter.isTextNode(node)) {
    return (node as TextNode).value || '';
  }
  const subtree = findNodes(node, n => adapter.isTextNode(n));
  return subtree.map(getTextContent).join('');
}

function setTextContent(node: Node, value: string): void {
  if (adapter.isCommentNode(node)) {
    (node as CommentNode).data = value;
  } else if (adapter.isTextNode(node)) {
    (node as TextNode).value = value;
  } else {
    const textNode: any = {
      nodeName: '#text',
      value: value,
      parentNode: node,
      attrs: [],
      __location: undefined,
    };
    (node as ParentNode).childNodes = [textNode as TextNode];
  }
}

/**
 * Removes element from the AST.
 */
function remove(node: ChildNode): void {
  const parent = node.parentNode;
  if (parent && parent.childNodes) {
    const idx = parent.childNodes.indexOf(node);
    parent.childNodes.splice(idx, 1);
  }
  (node as any).parentNode = undefined;
}

/**
 * Looks for a child node which passes the given test
 */
function findNode(nodes: Node[] | Node, test: (node: Node) => boolean): Node | null {
  const n = Array.isArray(nodes) ? nodes.slice() : [nodes];

  while (n.length > 0) {
    const node = n.shift();
    if (!node) {
      continue;
    }
    if (test(node)) {
      return node;
    }
    const children = adapter.getChildNodes(node as ParentNode);
    if (Array.isArray(children)) {
      n.unshift(...children);
    }
  }
  return null;
}

/**
 * Looks for all child nodes which passes the given test
 */
function findNodes(nodes: Node | Node[], test: (node: Node) => boolean): Node[] {
  const n = Array.isArray(nodes) ? nodes.slice() : [nodes];
  const found: Node[] = [];

  while (n.length) {
    const node = n.shift();
    if (!node) {
      continue;
    }
    if (test(node)) {
      found.push(node);
    }

    let children: Node[] = [];

    if (adapter.isElementNode(node) && adapter.getTagName(node) === 'template') {
      const content = adapter.getTemplateContent(node as any);
      if (content) {
        children = adapter.getChildNodes(content);
      }
    } else {
      children = adapter.getChildNodes(node as ParentNode);
    }

    if (Array.isArray(children)) {
      n.unshift(...children);
    }
  }
  return found;
}

/**
 * Looks for a child element which passes the given test
 */
function findElement(nodes: Node[] | Node, test: (node: Element) => boolean): Element | null {
  return findNode(nodes, n => adapter.isElementNode(n) && test(n as Element)) as Element | null;
}

/**
 * Looks for all child elements which passes the given test
 */
function findElements(nodes: Node | Node[], test: (node: Element) => boolean): Element[] {
  return findNodes(nodes, n => adapter.isElementNode(n) && test(n as Element)) as Element[];
}

function prepend(parent: ParentNode, node: ChildNode): void {
  parent.childNodes.unshift(node);
  node.parentNode = parent;
}

/**
 * Prepends HTML snippet to the given html document. The document must have either
 * a <body> or <head> element.
 */
function prependToDocument(document: string, appendedHtml: string): string | null {
  const documentAst = parse(document, { sourceCodeLocationInfo: true });
  let appendNode = findElement(documentAst, node => adapter.getTagName(node) === 'head');
  if (!appendNode || !appendNode.sourceCodeLocation || !appendNode.sourceCodeLocation.startTag) {
    // the original code did not contain a head
    appendNode = findElement(documentAst, node => adapter.getTagName(node) === 'body');
    if (!appendNode || !appendNode.sourceCodeLocation || !appendNode.sourceCodeLocation.startTag) {
      // the original code did not contain a head or body, so we go with the generated AST
      const head = findElement(documentAst, node => adapter.getTagName(node) === 'head');
      if (!head) throw new Error('parse5 did not generated a head element');
      const fragment = parseFragment(appendedHtml);
      for (const node of adapter.getChildNodes(fragment).reverse()) {
        prepend(head as ParentNode, node);
      }
      return serialize(documentAst);
    }
  }

  // the original source contained a head or body element, use string manipulation
  // to preserve original code formatting
  const { endOffset } = appendNode.sourceCodeLocation.startTag;
  const start = document.substring(0, endOffset);
  const end = document.substring(endOffset);
  return `${start}${appendedHtml}${end}`;
}

/**
 * Append HTML snippet to the given html document. The document must have either
 * a <body> or <head> element.
 */
function appendToDocument(document: string, appendedHtml: string): string {
  const documentAst = parse(document, { sourceCodeLocationInfo: true });
  let appendNode = findElement(documentAst, node => adapter.getTagName(node) === 'body');
  if (!appendNode || !appendNode.sourceCodeLocation || !appendNode.sourceCodeLocation.endTag) {
    // there is no body node in the source, use the head instead
    appendNode = findElement(documentAst, node => adapter.getTagName(node) === 'head');
    if (!appendNode || !appendNode.sourceCodeLocation || !appendNode.sourceCodeLocation.endTag) {
      // the original code did not contain a head or body, so we go with the generated AST
      const body = findElement(documentAst, node => adapter.getTagName(node) === 'body');
      if (!body) throw new Error('parse5 did not generated a body element');
      const fragment = parseFragment(appendedHtml);
      for (const node of adapter.getChildNodes(fragment)) {
        adapter.appendChild(body as ParentNode, node);
      }
      return serialize(documentAst);
    }
  }

  // the original source contained a head or body element, use string manipulation
  // to preserve original code formatting
  const { startOffset } = appendNode.sourceCodeLocation.endTag;
  const start = document.substring(0, startOffset);
  const end = document.substring(startOffset);
  return `${start}${appendedHtml}${end}`;
}

export const createDocument: typeof adapter.createDocument = adapter.createDocument as any;
export const createDocumentFragment: typeof adapter.createDocumentFragment =
  adapter.createDocumentFragment as any;
export { createElement };
export { createScript };
export const createCommentNode: typeof adapter.createCommentNode = adapter.createCommentNode as any;
export const appendChild: typeof adapter.appendChild = adapter.appendChild as any;
export const insertBefore: typeof adapter.insertBefore = adapter.insertBefore as any;
export const setTemplateContent: typeof adapter.setTemplateContent =
  adapter.setTemplateContent as any;
export const getTemplateContent: typeof adapter.getTemplateContent =
  adapter.getTemplateContent as any;
export const setDocumentType: typeof adapter.setDocumentType = adapter.setDocumentType as any;
export const setDocumentMode: typeof adapter.setDocumentMode = adapter.setDocumentMode as any;
export const getDocumentMode: typeof adapter.getDocumentMode = adapter.getDocumentMode as any;
export const detachNode: typeof adapter.detachNode = adapter.detachNode as any;
export const insertText: typeof adapter.insertText = adapter.insertText as any;
export const insertTextBefore: typeof adapter.insertTextBefore = adapter.insertTextBefore as any;
export const adoptAttributes: typeof adapter.adoptAttributes = adapter.adoptAttributes as any;
export const getFirstChild: typeof adapter.getFirstChild = adapter.getFirstChild as any;
export const getChildNodes: typeof adapter.getChildNodes = adapter.getChildNodes as any;
export const getParentNode: typeof adapter.getParentNode = adapter.getParentNode as any;
export const getAttrList: typeof adapter.getAttrList = adapter.getAttrList as any;
export const getTagName: typeof adapter.getTagName = adapter.getTagName as any;
export const getNamespaceURI: typeof adapter.getNamespaceURI = adapter.getNamespaceURI as any;
export const getTextNodeContent: typeof adapter.getTextNodeContent =
  adapter.getTextNodeContent as any;
export const getCommentNodeContent: typeof adapter.getCommentNodeContent =
  adapter.getCommentNodeContent as any;
export const getDocumentTypeNodeName: typeof adapter.getDocumentTypeNodeName =
  adapter.getDocumentTypeNodeName as any;
export const getDocumentTypeNodePublicId: typeof adapter.getDocumentTypeNodePublicId =
  adapter.getDocumentTypeNodePublicId as any;
export const getDocumentTypeNodeSystemId: typeof adapter.getDocumentTypeNodeSystemId =
  adapter.getDocumentTypeNodeSystemId as any;
export const isTextNode: typeof adapter.isTextNode = adapter.isTextNode as any;
export const isCommentNode: typeof adapter.isCommentNode = adapter.isCommentNode as any;
export const isDocumentTypeNode: typeof adapter.isDocumentTypeNode =
  adapter.isDocumentTypeNode as any;
export const isElementNode: typeof adapter.isElementNode = adapter.isElementNode as any;
export const setNodeSourceCodeLocation: typeof adapter.setNodeSourceCodeLocation =
  adapter.setNodeSourceCodeLocation as any;
export const getNodeSourceCodeLocation: typeof adapter.getNodeSourceCodeLocation =
  adapter.getNodeSourceCodeLocation as any;
export { isHtmlFragment };
export { hasAttribute };
export { getAttribute };
export { getAttributes };
export { setAttribute };
export { setAttributes };
export { removeAttribute };
export { setTextContent };
export { getTextContent };
export { remove };
export { findNode };
export { findNodes };
export { findElement };
export { findElements };
export { prepend };
export { prependToDocument };
export { appendToDocument };
