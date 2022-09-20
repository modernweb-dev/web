/** @typedef {import('parse5').TreeAdapter} TreeAdapter */
/** @typedef {import('parse5/dist/tree-adapters/default').Element} Element */
/** @typedef {import('parse5/dist/tree-adapters/default').Node} Node */
/** @typedef {import('parse5/dist/tree-adapters/default').ParentNode} ParentNode */
/** @typedef {import('parse5/dist/tree-adapters/default').ChildNode} ChildNode */
/** @typedef {import('parse5/dist/tree-adapters/default').CommentNode} CommentNode */
/** @typedef {import('parse5/dist/tree-adapters/default').TextNode} TextNode */

const parse5 = require('parse5');
const { defaultTreeAdapter: adapter } = require('parse5');
const { query, isElementNode } = require('@parse5/tools');

const REGEXP_IS_HTML_DOCUMENT = /^\s*<(!doctype|html|head|body)\b/i;

/**
 * @param {string} html
 */
function isHtmlFragment(html) {
  let htmlWithoutComments = html.replace(/<!--.*?-->/gs, '');
  return !REGEXP_IS_HTML_DOCUMENT.test(htmlWithoutComments);
}

/**
 * Append HTML snippet to the given html document. The document must have either
 * a <body> or <head> element.
 * @param {string} document
 * @param {string} appendedHtml
 */
function appendToDocument(document, appendedHtml) {
  const documentAst = parse5.parse(document, { sourceCodeLocationInfo: true });
  let appendNode = /** @type {Element|null} */ (
    query(documentAst, node => isElementNode(node) && adapter.getTagName(node) === 'body')
  );
  if (!appendNode || !appendNode.sourceCodeLocation || !appendNode.sourceCodeLocation?.endTag) {
    // there is no body node in the source, use the head instead
    appendNode = /** @type {Element|null} */ (
      query(documentAst, node => isElementNode(node) && adapter.getTagName(node) === 'head')
    );
    if (!appendNode || !appendNode.sourceCodeLocation || !appendNode.sourceCodeLocation?.endTag) {
      // the original code did not contain a head or body, so we go with the generated AST
      const body = /** @type {Element|null} */ (
        query(documentAst, node => isElementNode(node) && adapter.getTagName(node) === 'body')
      );
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

module.exports.isHtmlFragment = isHtmlFragment;
module.exports.appendToDocument = appendToDocument;
