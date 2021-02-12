# parse5-utils

Utils for using parse5.

## Usage

Examples:

```js
import { parse } from 'parse5';
import { createElement, getTagName, appendChild, findElement } from '@web/parse5-utils';

const doc = parse(`
  <html>
    <body>
      <my-element></my-element>
      <div id="foo"></div>
    </body>
  </html>`);

const body = findElement(doc, e => getTagName(e) === 'body');
const script = createElement('script', { src: './foo.js' });
appendChild(body, script);
```

```js
import { parse } from 'parse5';
import { getTagName, getAttribute, findElements } from '@web/parse5-utils';

const doc = parse(`
  <html>
    <body>
      <script src="./a.js"></script>
      <script type="module" src="./b.js"></script>
      <script type="module" src="./c.js"></script>
    </body>
  </html>`);

const allModuleScripts = findElements(
  doc,
  e => getTagName(e) === 'script' && getAttribute(e, 'type') === 'module',
);
```

`appendToDocument` and `prependToDocument` will inject a snippet of HTML into the page, making sure it is executed last or first respectively.

It tries to avoid changing the formatting of the original file, using parse5 to find out the location of `body` and `head` tags and string concatenation in the original code to do the actual injection. In case of incomplete or invalid HTML it may fall back parse5 to generate a valid document and inject using AST manipulation.

```js
import { prependToDocument, appendToDocument } from '@web/parse5-utils';

const html = '<html><body></body></html>';
const htmlWithInjectedScript = appendToDocument(
  html,
  '<scrip type="module" src="./injected-script.js"></script>',
);
```

## Available functions

- createDocument
- createDocumentFragment
- createElement
- createScript
- createCommentNode
- appendChild
- insertBefore
- setTemplateContent
- getTemplateContent
- setDocumentType
- setDocumentMode
- getDocumentMode
- detachNode
- insertText
- insertTextBefore
- adoptAttributes
- getFirstChild
- getChildNodes
- getParentNode
- getAttrList
- getTagName
- getNamespaceURI
- getTextNodeContent
- getCommentNodeContent
- getDocumentTypeNodeName
- getDocumentTypeNodePublicId
- getDocumentTypeNodeSystemId
- isTextNode
- isCommentNode
- isDocumentTypeNode
- isElementNode
- setNodeSourceCodeLocation
- getNodeSourceCodeLocation
- updateNodeSourceCodeLocation
- isHtmlFragment
- hasAttribute
- getAttribute
- getAttributes
- setAttribute
- setAttributes
- setTextContent
- getTextContent
- removeAttribute
- remove
- findNode
- findNodes
- findElement
- findElements
- prependToDocument
- appendToDocument
