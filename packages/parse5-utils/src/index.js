/** @typedef {import('parse5').TreeAdapter} TreeAdapter */
/** @typedef {import('parse5').Element} Element */
/** @typedef {import('parse5').Attribute} Attribute */
/** @typedef {import('parse5').Node} Node */
/** @typedef {import('parse5').ParentNode} ParentNode */
/** @typedef {import('parse5').ChildNode} ChildNode */
/** @typedef {import('parse5').CommentNode} CommentNode */
/** @typedef {import('parse5').TextNode} TextNode */

const parse5 = require('parse5');
const adapter = require('parse5/lib/tree-adapters/default');

const DEFAULT_NAMESPACE = 'http://www.w3.org/1999/xhtml';
const REGEXP_IS_HTML_DOCUMENT = /^\s*<(!doctype|html|head|body)\b/i;

/**
 * Creates an element node.
 *
 * @param {string} tagName Tag name of the element.
 * @param {Record<string, string>} attrs Attribute name-value pair array. Foreign attributes may contain `namespace` and `prefix` fields as well.
 * @param {string} namespaceURI  Namespace of the element.
 * @returns {Element}
 */
function createElement(tagName, attrs = {}, namespaceURI = DEFAULT_NAMESPACE) {
  const attrsArray = Object.entries(attrs).map(([name, value]) => ({ name, value }));
  return adapter.createElement(tagName, namespaceURI, attrsArray);
}

/**
 * Creates a script element.
 * @param {Record<string,string>} [attrs]
 * @param {string} [code]
 * @returns {Element}
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
  let htmlWithoutComments = html.replace(/<!--.*?-->/gs, '');
  return !REGEXP_IS_HTML_DOCUMENT.test(htmlWithoutComments);
}

/**
 * @param {Element} element
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
 * @param {Element} element
 * @param {string} name
 */
function getAttribute(element, name) {
  const attrList = adapter.getAttrList(element);
  if (!attrList) {
    return null;
  }

  const attr = attrList.find(a => a.name == name);
  if (attr) {
    return attr.value;
  }
}

/**
 * @param {Element} element
 * @param {string} name
 */
function hasAttribute(element, name) {
  return getAttribute(element, name) != null;
}

/**
 * @param {Element} element
 * @param {string} name
 * @param {string} value
 */
function setAttribute(element, name, value) {
  const attrs = adapter.getAttrList(element);
  const existing = attrs.find(a => a.name === name);

  if (existing) {
    existing.value = value;
  } else {
    attrs.push({ name, value });
  }
}

/**
 * @param {Element} element
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
 * @param {Element} element
 * @param {string} name
 */
function removeAttribute(element, name) {
  const attrs = adapter.getAttrList(element);
  element.attrs = attrs.filter(attr => attr.name !== name);
}

/**
 * @param {Node} node
 * @returns {string}
 */
function getTextContent(node) {
  if (adapter.isCommentNode(node)) {
    return node.data || '';
  }
  if (adapter.isTextNode(node)) {
    return node.value || '';
  }
  const subtree = findNodes(node, n => adapter.isTextNode(n));
  return subtree.map(getTextContent).join('');
}

/**
 * @param {Node} node
 * @param {string} value
 */
function setTextContent(node, value) {
  if (adapter.isCommentNode(node)) {
    node.data = value;
  } else if (adapter.isTextNode(node)) {
    node.value = value;
  } else {
    const textNode = {
      nodeName: '#text',
      value: value,
      parentNode: node,
      attrs: [],
      __location: undefined,
    };
    /** @type {ParentNode} */ (node).childNodes = [/** @type {TextNode} */ (textNode)];
  }
}

/**
 * Removes element from the AST.
 * @param {ChildNode} node
 */
function remove(node) {
  const parent = node.parentNode;
  if (parent && parent.childNodes) {
    const idx = parent.childNodes.indexOf(node);
    parent.childNodes.splice(idx, 1);
  }
  /** @type {any} */ (node).parentNode = undefined;
}

/**
 * Looks for a child node which passes the given test
 * @param {Node[] | Node} nodes
 * @param {(node: Node) => boolean} test
 * @returns {Node | null}
 */
function findNode(nodes, test) {
  const n = Array.isArray(nodes) ? nodes.slice() : [nodes];

  while (n.length > 0) {
    const node = n.shift();
    if (!node) {
      continue;
    }
    if (test(node)) {
      return node;
    }
    const children = adapter.getChildNodes(/** @type {ParentNode} */ (node));
    if (Array.isArray(children)) {
      n.unshift(...children);
    }
  }
  return null;
}

/**
 * Looks for all child nodes which passes the given test
 * @param {Node | Node[]} nodes
 * @param {(node: Node) => boolean} test
 * @returns {Node[]}
 */
function findNodes(nodes, test) {
  const n = Array.isArray(nodes) ? nodes.slice() : [nodes];
  /** @type {Node[]} */
  const found = [];

  while (n.length) {
    const node = n.shift();
    if (!node) {
      continue;
    }
    if (test(node)) {
      found.push(node);
    }

    /** @type {Node[]} */
    let children = [];

    if (adapter.isElementNode(node) && adapter.getTagName(node) === 'template') {
      const content = adapter.getTemplateContent(node);
      if (content) {
        children = adapter.getChildNodes(content);
      }
    } else {
      children = adapter.getChildNodes(/** @type {ParentNode} */ (node));
    }

    if (Array.isArray(children)) {
      n.unshift(...children);
    }
  }
  return found;
}

/**
 * Looks for a child element which passes the given test
 * @param {Node[] | Node} nodes
 * @param {(node: Element) => boolean} test
 * @returns {Element | null}
 */
function findElement(nodes, test) {
  return /** @type {Element | null} */ (findNode(nodes, n => adapter.isElementNode(n) && test(n)));
}

/**
 * Looks for all child elements which passes the given test
 * @param {Node | Node[]} nodes
 * @param {(node: Element) => boolean} test
 * @returns {Element[]}
 */
function findElements(nodes, test) {
  return /** @type {Element[]} */ (findNodes(nodes, n => adapter.isElementNode(n) && test(n)));
}

/**
 * @param {ParentNode} parent
 * @param {ChildNode} node
 */
function prepend(parent, node) {
  parent.childNodes.unshift(node);
  node.parentNode = parent;
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
module.exports.prepend = prepend;
module.exports.prependToDocument = prependToDocument;
module.exports.appendToDocument = appendToDocument;
