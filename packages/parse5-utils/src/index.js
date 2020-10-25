/** @typedef {import('parse5').TreeAdapter} TreeAdapter */
/** @typedef {import('parse5').Element} Element */
/** @typedef {import('parse5').Attribute} Attribute */
/** @typedef {import('parse5').Node} Node */
/** @typedef {import('parse5').ParentNode} ParentNode */
/** @typedef {import('parse5').ChildNode} ChildNode */
/** @typedef {import('parse5').DefaultTreeElement} DefaultTreeElement */
/** @typedef {import('parse5').DefaultTreeNode} DefaultTreeNode */
/** @typedef {import('parse5').DefaultTreeChildNode} DefaultTreeChildNode */
/** @typedef {import('parse5').DefaultTreeCommentNode} DefaultTreeCommentNode */
/** @typedef {import('parse5').DefaultTreeTextNode} DefaultTreeTextNode */

const parse5 = require('parse5');
// the tree adapter is not in the parse5 types
//@ts-ignore
const adapter = /** @type {TreeAdapter} */ (require('parse5/lib/tree-adapters/default'));

const DEFAULT_NAMESPACE = 'http://www.w3.org/1999/xhtml';
const REGEXP_IS_HTML_DOCUMENT = /^\s*<(!doctype|html|head|body)\b/i;

/**
 * Creates an element node.
 *
 * @param {string} tagName Tag name of the element.
 * @param {Record<string, string>} attrs Attribute name-value pair array. Foreign attributes may contain `namespace` and `prefix` fields as well.
 * @param {string} namespaceURI  Namespace of the element.
 */
function createElement(tagName, attrs = {}, namespaceURI = DEFAULT_NAMESPACE) {
  const attrsArray = Object.entries(attrs).map(([name, value]) => ({ name, value }));
  return adapter.createElement(tagName, namespaceURI, attrsArray);
}

/**
 * Creates a script element.
 * @param {Record<string,string>} [attrs]
 * @param {string} [code]
 */
function createScript(attrs = {}, code = undefined) {
  const element = createElement('script', attrs);
  if (code) {
    setTextContent(element, code);
  }
  return element;
}

/**
 * @param {string} html
 */
function isHtmlFragment(html) {
  return !REGEXP_IS_HTML_DOCUMENT.test(html);
}

/**
 * @param {Node} element
 */
function getAttributes(element) {
  const attrsArray = adapter.getAttrList(element);
  /** @type {Record<string,string>} */
  const attrsObj = {};
  for (const e of attrsArray) {
    attrsObj[e.name] = e.value;
  }
  return attrsObj;
}

/**
 * @param {Node} element
 * @param {string} name
 */
function getAttribute(element, name) {
  const attrList = adapter.getAttrList(element);
  if (!attrList) {
    return null;
  }

  const attr = adapter.getAttrList(element).find(e => e.name == name);
  if (attr) {
    return attr.value;
  }
}

/**
 * @param {Node} element
 * @param {string} name
 */
function hasAttribute(element, name) {
  return getAttribute(element, name) != null;
}

/**
 *
 * @param {Node} node
 * @param {string} name
 * @param {string} value
 */
function setAttribute(node, name, value) {
  const attrs = adapter.getAttrList(node);
  const existing = attrs.find(a => a.name === name);

  if (existing) {
    existing.value = value;
  } else {
    attrs.push({ name, value });
  }
}

/**
 * @param {Node} element
 * @param {Record<string,string|undefined>} attributes
 */
function setAttributes(element, attributes) {
  for (const [name, value] of Object.entries(attributes)) {
    if (value !== undefined) {
      setAttribute(element, name, value);
    }
  }
}

/**
 * @param {Node} node
 * @param {string} name
 */
function removeAttribute(node, name) {
  const attrs = adapter.getAttrList(node);
  // parse5 types are broken
  /** @type {any} */ (node).attrs = attrs.filter(attr => attr.name !== name);
}

/**
 * @param {Node} node
 * @returns {string}
 */
function getTextContent(node) {
  if (adapter.isCommentNode(node)) {
    return /** @type {DefaultTreeCommentNode} */ (node).data || '';
  }
  if (adapter.isTextNode(node)) {
    return /** @type {DefaultTreeTextNode} */ (node).value || '';
  }
  const subtree = findNodes(node, n => adapter.isTextNode(n));
  return subtree.map(getTextContent).join('');
}

/**
 * @param {Element} node
 * @param {string} value
 */
function setTextContent(node, value) {
  if (adapter.isCommentNode(node)) {
    /** @type {DefaultTreeCommentNode} */ (node).data = value;
  } else if (adapter.isTextNode(node)) {
    /** @type {DefaultTreeTextNode} */ (node).value = value;
  } else {
    const textNode = {
      nodeName: '#text',
      value: value,
      parentNode: node,
      attrs: [],
      __location: undefined,
    };
    /** @type {DefaultTreeElement} */ (node).childNodes = [textNode];
  }
}

/**
 * Removes element from the AST.
 * @param {ChildNode} node
 */
function remove(node) {
  const n = /** @type {DefaultTreeChildNode} */ (node);
  const parent = n.parentNode;
  if (parent && parent.childNodes) {
    const idx = parent.childNodes.indexOf(n);
    parent.childNodes.splice(idx, 1);
  }
  /** @type {any} */ (n).parentNode = undefined;
}

/**
 * Looks for a child node which passes the given test
 * @param {Node[] | Node} nodes
 * @param {(node: DefaultTreeNode) => boolean} test
 * @returns {DefaultTreeNode | null}
 */
function findNode(nodes, test) {
  const n = Array.isArray(nodes) ? nodes.slice() : [nodes];

  while (n.length > 0) {
    const node = /** @type {DefaultTreeNode} */ (n.shift());
    if (!node) {
      continue;
    }
    if (test(node)) {
      return node;
    }
    const children = adapter.getChildNodes(node);
    if (Array.isArray(children)) {
      n.unshift(...children);
    }
  }
  return null;
}

/**
 * Looks for all child nodes which passes the given test
 * @param {Node | Node[]} nodes
 * @param {(node: DefaultTreeNode) => boolean} test
 * @returns {DefaultTreeNode[]}
 */
function findNodes(nodes, test) {
  const n = Array.isArray(nodes) ? nodes.slice() : [nodes];
  /** @type {DefaultTreeNode[]} */
  const found = [];

  while (n.length) {
    const node = /** @type {DefaultTreeNode} */ (n.shift());
    if (!node) {
      continue;
    }
    if (test(node)) {
      found.push(node);
    }
    const children = adapter.getChildNodes(node);
    if (Array.isArray(children)) {
      n.unshift(...children);
    }
  }
  return found;
}

/**
 * Looks for a child element which passes the given test
 * @param {Node[] | Node} nodes
 * @param {(node: DefaultTreeElement) => boolean} test
 * @returns {DefaultTreeElement | null}
 */
function findElement(nodes, test) {
  return /** @type {DefaultTreeElement | null} */ (findNode(
    nodes,
    n => adapter.isElementNode(n) && test(/** @type {DefaultTreeElement} */ (n)),
  ));
}

/**
 * Looks for all child elements which passes the given test
 * @param {Node | Node[]} nodes
 * @param {(node: Node) => boolean} test
 * @returns {DefaultTreeElement[]}
 */
function findElements(nodes, test) {
  return /** @type {DefaultTreeElement[] } */ (findNodes(
    nodes,
    n => adapter.isElementNode(n) && test(/** @type {DefaultTreeElement} */ (n)),
  ));
}

/**
 * @param {ParentNode} parent
 * @param {ChildNode} node
 */
function prepend(parent, node) {
  /** @type {any} */ (parent).childNodes.unshift(node);
  /** @type {any} */ (node).parentNode = parent;
}

/**
 * Prepends HTML snippet to the given html document. The document must have either
 * a <body> or <head> element.
 * @param {string} document
 * @param {string} appendedHtml
 * @returns {string | null}
 */
function prependToDocument(document, appendedHtml) {
  const documentAst = parse5.parse(document, { sourceCodeLocationInfo: true });
  let appendNode = findElement(documentAst, node => adapter.getTagName(node) === 'head');
  if (!appendNode || !appendNode.sourceCodeLocation || !appendNode.sourceCodeLocation.startTag) {
    // the original code did not contain a head
    appendNode = findElement(documentAst, node => adapter.getTagName(node) === 'body');
    if (!appendNode || !appendNode.sourceCodeLocation || !appendNode.sourceCodeLocation.startTag) {
      // the original code did not contain a head or body, so we go with the generated AST
      const head = findElement(documentAst, node => adapter.getTagName(node) === 'head');
      if (!head) throw new Error('parse5 did not generated a head element');
      const fragment = parse5.parseFragment(appendedHtml);
      for (const node of adapter.getChildNodes(fragment).reverse()) {
        prepend(head, node);
      }
      return parse5.serialize(documentAst);
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
 * @param {string} document
 * @param {string} appendedHtml
 */
function appendToDocument(document, appendedHtml) {
  const documentAst = parse5.parse(document, { sourceCodeLocationInfo: true });
  let appendNode = findElement(documentAst, node => adapter.getTagName(node) === 'body');
  if (!appendNode || !appendNode.sourceCodeLocation || !appendNode.sourceCodeLocation.endTag) {
    // there is no body node in the source, use the head instead
    appendNode = findElement(documentAst, node => adapter.getTagName(node) === 'head');
    if (!appendNode || !appendNode.sourceCodeLocation || !appendNode.sourceCodeLocation.endTag) {
      // the original code did not contain a head or body, so we go with the generated AST
      const body = findElement(documentAst, node => adapter.getTagName(node) === 'body');
      if (!body) throw new Error('parse5 did not generated a body element');
      const fragment = parse5.parseFragment(appendedHtml);
      for (const node of adapter.getChildNodes(fragment)) {
        adapter.appendChild(body, node);
      }
      return parse5.serialize(documentAst);
    }
  }

  // the original source contained a head or body element, use string manipulation
  // to preserve original code formatting
  const { startOffset } = appendNode.sourceCodeLocation.endTag;
  const start = document.substring(0, startOffset);
  const end = document.substring(startOffset);
  return `${start}${appendedHtml}${end}`;
}

module.exports.createDocument = adapter.createDocument;
module.exports.createDocumentFragment = adapter.createDocumentFragment;
module.exports.createElement = createElement;
module.exports.createScript = createScript;
module.exports.createCommentNode = adapter.createCommentNode;
module.exports.appendChild = adapter.appendChild;
module.exports.insertBefore = adapter.insertBefore;
module.exports.setTemplateContent = adapter.setTemplateContent;
module.exports.getTemplateContent = adapter.getTemplateContent;
module.exports.setDocumentType = adapter.setDocumentType;
module.exports.setDocumentMode = adapter.setDocumentMode;
module.exports.getDocumentMode = adapter.getDocumentMode;
module.exports.detachNode = adapter.detachNode;
module.exports.insertText = adapter.insertText;
module.exports.insertTextBefore = adapter.insertTextBefore;
module.exports.adoptAttributes = adapter.adoptAttributes;
module.exports.getFirstChild = adapter.getFirstChild;
module.exports.getChildNodes = adapter.getChildNodes;
module.exports.getParentNode = adapter.getParentNode;
module.exports.getAttrList = adapter.getAttrList;
module.exports.getTagName = adapter.getTagName;
module.exports.getNamespaceURI = adapter.getNamespaceURI;
module.exports.getTextNodeContent = adapter.getTextNodeContent;
module.exports.getCommentNodeContent = adapter.getCommentNodeContent;
module.exports.getDocumentTypeNodeName = adapter.getDocumentTypeNodeName;
module.exports.getDocumentTypeNodePublicId = adapter.getDocumentTypeNodePublicId;
module.exports.getDocumentTypeNodeSystemId = adapter.getDocumentTypeNodeSystemId;
module.exports.isTextNode = adapter.isTextNode;
module.exports.isCommentNode = adapter.isCommentNode;
module.exports.isDocumentTypeNode = adapter.isDocumentTypeNode;
module.exports.isElementNode = adapter.isElementNode;
module.exports.setNodeSourceCodeLocation = adapter.setNodeSourceCodeLocation;
module.exports.getNodeSourceCodeLocation = adapter.getNodeSourceCodeLocation;
module.exports.isHtmlFragment = isHtmlFragment;
module.exports.hasAttribute = hasAttribute;
module.exports.getAttribute = getAttribute;
module.exports.getAttributes = getAttributes;
module.exports.setAttribute = setAttribute;
module.exports.setAttributes = setAttributes;
module.exports.removeAttribute = removeAttribute;
module.exports.setTextContent = setTextContent;
module.exports.getTextContent = getTextContent;
module.exports.remove = remove;
module.exports.findNode = findNode;
module.exports.findNodes = findNodes;
module.exports.findElement = findElement;
module.exports.findElements = findElements;
module.exports.prependToDocument = prependToDocument;
module.exports.appendToDocument = appendToDocument;
