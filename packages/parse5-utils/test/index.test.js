const { expect } = require('chai');
const { parse, serialize } = require('parse5');
const { getAttribute, getTextContent, findElement } = require('../src/index');
const utils = require('../src/index');

describe('parse5-utils', () => {
  describe('createElement', () => {
    it('creates an element', () => {
      const doc = parse('');
      const el = utils.createElement('my-element');
      utils.appendChild(doc, el);
      expect(serialize(doc)).to.equal(
        '<html><head></head><body></body></html><my-element></my-element>',
      );
    });

    it('creates an element with attributes', () => {
      const doc = parse('');
      const el = utils.createElement('my-element', { foo: 'bar', x: '' });
      utils.appendChild(doc, el);
      expect(serialize(doc)).to.equal(
        '<html><head></head><body></body></html><my-element foo="bar" x=""></my-element>',
      );
    });
  });

  describe('createScript', () => {
    it('create a script', () => {
      const doc = parse('');
      const el = utils.createScript();
      utils.appendChild(doc, el);
      expect(serialize(doc)).to.equal('<html><head></head><body></body></html><script></script>');
    });

    it('create a script with attributes', () => {
      const doc = parse('');
      const el = utils.createScript({ type: 'module' });
      utils.appendChild(doc, el);
      expect(serialize(doc)).to.equal(
        '<html><head></head><body></body></html><script type="module"></script>',
      );
    });

    it('create a script with text content', () => {
      const doc = parse('');
      const el = utils.createScript({ type: 'module' }, 'console.log("x");');
      utils.appendChild(doc, el);
      expect(serialize(doc)).to.equal(
        '<html><head></head><body></body></html><script type="module">console.log("x");</script>',
      );
    });
  });

  describe('isHtmlFragment()', () => {
    it('returns whether a HTML string is a fragment', () => {
      expect(utils.isHtmlFragment('<my-element></my-element>')).to.equal(true);
      expect(utils.isHtmlFragment('')).to.equal(true);
      expect(utils.isHtmlFragment('foo')).to.equal(true);
      expect(utils.isHtmlFragment('<div></div>')).to.equal(true);
      expect(utils.isHtmlFragment('<!-- COMMENT --><!DOCTYPE><my-element></my-element>')).to.equal(
        false,
      );
      expect(
        utils.isHtmlFragment(`<!--
      COMMENT
      --><!DOCTYPE><my-element></my-element>`),
      ).to.equal(false);
      expect(utils.isHtmlFragment('<!DOCTYPE><my-element></my-element>')).to.equal(false);
      expect(utils.isHtmlFragment('  <!DOCTYPE><my-element></my-element>')).to.equal(false);
      expect(utils.isHtmlFragment('  <html><my-element></my-element></html>')).to.equal(false);
      expect(utils.isHtmlFragment('  <body><my-element></my-element></body>')).to.equal(false);
      expect(utils.isHtmlFragment('  <head><my-element></my-element></head>')).to.equal(false);
    });
  });

  describe('getAttributes()', () => {
    it('returns the attributes of an element', () => {
      const el = utils.createElement('my-element', { foo: 'bar', x: '' });
      expect(utils.getAttributes(el)).to.eql({ foo: 'bar', x: '' });
    });

    it('returns an empty object if there are no attributes', () => {
      const el = utils.createElement('my-element');
      expect(utils.getAttributes(el)).to.eql({});
    });
  });

  describe('getAttribute()', () => {
    it('returns a single attribute', () => {
      const el = utils.createElement('my-element', { foo: 'bar', x: '' });
      expect(utils.getAttribute(el, 'foo')).to.eql('bar');
    });

    it('returns undefined if the attribute was not found', () => {
      const el = utils.createElement('my-element', { foo: 'bar', x: '' });
      expect(utils.getAttribute(el, 'y')).to.eql(undefined);
    });
  });

  describe('setAttribute()', () => {
    it('can set the attribute on an element', () => {
      const doc = parse('');
      const el = utils.createElement('my-element');
      utils.appendChild(doc, el);
      utils.setAttribute(el, 'foo', 'bar');
      expect(serialize(doc)).to.eql(
        '<html><head></head><body></body></html><my-element foo="bar"></my-element>',
      );
    });

    it('can overwrite an existing attribute', () => {
      const doc = parse('');
      const el = utils.createElement('my-element', { foo: 'bar' });
      utils.appendChild(doc, el);
      utils.setAttribute(el, 'foo', 'not-bar');
      expect(serialize(doc)).to.eql(
        '<html><head></head><body></body></html><my-element foo="not-bar"></my-element>',
      );
    });
  });

  describe('setAttributes()', () => {
    it('can set multiple attributes on an element', () => {
      const doc = parse('');
      const el = utils.createElement('my-element');
      utils.appendChild(doc, el);
      utils.setAttributes(el, { foo: 'bar', lorem: 'ipsum', x: undefined });
      expect(serialize(doc)).to.eql(
        '<html><head></head><body></body></html><my-element foo="bar" lorem="ipsum"></my-element>',
      );
    });
  });

  describe('removeAttribute()', () => {
    it('removes attribute from an element', () => {
      const doc = parse('');
      const el = utils.createElement('my-element', { foo: 'bar', x: 'y' });
      utils.appendChild(doc, el);
      utils.removeAttribute(el, 'x');
      expect(serialize(doc)).to.eql(
        '<html><head></head><body></body></html><my-element foo="bar"></my-element>',
      );
    });
  });

  describe('getTextContent()', () => {
    it('returns the node text', () => {
      const doc = parse('<html><body><div id="myDiv">Hello world</div></body></html>');
      const myDiv = utils.findElement(doc, e => getAttribute(e, 'id') === 'myDiv');
      if (!myDiv) throw new Error();
      expect(getTextContent(myDiv)).to.equal('Hello world');
    });

    it('returns multiple nodes text', () => {
      const doc = parse(
        '<html><body><div id="myDiv">Top level<div>Before<div>A</div><div>B</div>After</div></div></body></html>',
      );
      const myDiv = utils.findElement(doc, e => getAttribute(e, 'id') === 'myDiv');
      if (!myDiv) throw new Error();
      expect(getTextContent(myDiv)).to.equal('Top levelBeforeABAfter');
    });
  });

  describe('setTextContent()', () => {
    it('sets the text of an element', () => {
      const doc = parse('<html><body></body></html>');
      const el = utils.createElement('script');
      utils.setTextContent(el, 'foo bar');
      utils.appendChild(doc, el);
      expect(serialize(doc)).to.equal(
        '<html><head></head><body></body></html><script>foo bar</script>',
      );
    });
  });

  describe('remove()', () => {
    it('removes element from the AST', () => {
      const doc = parse('<html><body><div id="myDiv"></div></body></html>');
      const div = findElement(doc, e => utils.getAttribute(e, 'id') === 'myDiv');
      if (!div) throw new Error('element not found');
      utils.remove(div);
      expect(serialize(doc)).to.equal('<html><head></head><body></body></html>');
    });
  });

  describe('findElement()', () => {
    it('returns a matching element', () => {
      const doc = parse(`
      <html>
        <body>
          <div foo="1"></div>
          <div foo="2"></div>
          <div foo="3"></div>
        </body>
      </html>
    `);
      const found = utils.findElement(doc, el => utils.getAttribute(el, 'foo') === '2');
      if (!found) {
        throw new Error('No element found.');
      }
      expect(utils.getAttribute(found, 'foo')).to.equal('2');
    });

    it('returns the first match', () => {
      const doc = parse(`
      <html>
        <body>
          <div index="1" foo="bar"></div>
          <div index="2" foo="bar"></div>
          <div index="3" foo="bar"></div>
        </body>
      </html>
    `);
      const found = utils.findElement(doc, el => utils.getAttribute(el, 'foo') === 'bar');
      if (!found) {
        throw new Error('No element found.');
      }
      expect(utils.getAttribute(found, 'foo')).to.equal('bar');
      expect(utils.getAttribute(found, 'index')).to.equal('1');
    });

    it('returns nested elements', () => {
      const doc = parse(`
      <html>
        <body>
          <div>
            <div>
              <div id="foo">Hello world</div>
            </div>
            <div></div>
          </div>
          <div></div>
          <div></div>
          <div></div>
        </body>
      </html>
    `);
      const found = utils.findElement(doc, el => utils.getAttribute(el, 'id') === 'foo');
      if (!found) {
        throw new Error('No element found.');
      }
      expect(found).to.exist;
    });
  });

  describe('findElements()', () => {
    it('returns a single matched element', () => {
      const doc = parse(`
      <html>
        <body>
          <div foo="1"></div>
          <div foo="2"></div>
          <div foo="3"></div>
        </body>
      </html>
    `);
      const found = utils.findElements(doc, el => utils.getAttribute(el, 'foo') === '2');
      expect(found.length).to.equal(1);
      expect(utils.getAttribute(found[0], 'foo')).to.equal('2');
    });

    it('returns multiple matched elements', () => {
      const doc = parse(`
      <html>
        <body>
          <div index="1" foo="bar"></div>
          <div index="2" foo="bar"></div>
          <div index="3" foo="bar"></div>
        </body>
      </html>
    `);
      const found = utils.findElements(doc, el => utils.getAttribute(el, 'foo') === 'bar');
      expect(found.length).to.equal(3);
      const indices = found.map(f => utils.getAttribute(f, 'index'));
      expect(indices).to.eql(['1', '2', '3']);
    });

    it('returns an empty array when there are no matches', () => {
      const doc = parse(`
      <html>
        <body>
          <div foo="1"></div>
          <div foo="2"></div>
          <div foo="3"></div>
        </body>
      </html>
    `);
      const found = utils.findElements(doc, el => utils.hasAttribute(el, 'non-existing'));
      expect(found.length).to.equal(0);
    });

    it('returns child elements within template elements', () => {
      const doc = parse(`
      <html>
        <body>
          <template>
            <img src="foo.png" />
          </template>
        </body>
      </html>
    `);

      const found = utils.findElements(doc, el => utils.hasAttribute(el, 'src'));
      expect(found.length).to.equal(1);
    });
  });

  describe('prependToDocument', () => {
    it('injects a HTML snippet to the document', () => {
      const document = '<html><head></head><body></body></html>';
      const result = utils.prependToDocument(document, '<div>Hello world</div>');
      if (!result) throw new Error();
      expect(result).to.equal('<html><head><div>Hello world</div></head><body></body></html>');
    });

    it('injects before other elements', () => {
      const document =
        '<html><head><div>A</div><div>B</div></head><body><div>C</div></body></html>';
      const result = utils.prependToDocument(document, '<div>Hello world</div>');
      if (!result) throw new Error();
      expect(result).to.equal(
        '<html><head><div>Hello world</div><div>A</div><div>B</div></head><body><div>C</div></body></html>',
      );
    });

    it('injects into body if there is no head', () => {
      const document = '<html><body><div>A</div></body></html>';
      const result = utils.prependToDocument(document, '<div>Hello world</div>');
      if (!result) throw new Error();
      expect(result).to.equal('<html><body><div>Hello world</div><div>A</div></body></html>');
    });

    it('uses AST manipulation if there is no head or body', () => {
      const document = '<html></html>';
      const result = utils.prependToDocument(document, '<div>A</div><div>B</div>');
      expect(result).to.equal('<html><head><div>A</div><div>B</div></head><body></body></html>');
    });
  });

  describe('appendToDocument', () => {
    it('injects a HTML snippet to the document', () => {
      const document = '<html><head></head><body></body></html>';
      const result = utils.appendToDocument(document, '<div>Hello world</div>');
      if (!result) throw new Error();
      expect(result).to.equal('<html><head></head><body><div>Hello world</div></body></html>');
    });

    it('injects after other elements', () => {
      const document =
        '<html><head><script>A</script></head><body><script>B</script><script>C</script></body></html>';
      const result = utils.appendToDocument(document, '<div>Hello world</div>');
      if (!result) throw new Error();
      expect(result).to.equal(
        '<html><head><script>A</script></head><body><script>B</script><script>C</script><div>Hello world</div></body></html>',
      );
    });

    it('injects into head if there is no body', () => {
      const document = '<html><head><script>A</script></head></html>';
      const result = utils.appendToDocument(document, '<div>Hello world</div>');
      if (!result) throw new Error();
      expect(result).to.equal('<html><head><script>A</script><div>Hello world</div></head></html>');
    });

    it('returns null if there is no head or body', () => {
      const document = '<html></html>';
      const result = utils.appendToDocument(document, '<div>A</div><div>B</div>');
      expect(result).to.equal('<html><head></head><body><div>A</div><div>B</div></body></html>');
    });
  });
});
