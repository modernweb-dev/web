import { getTextContent } from '@web/parse5-utils';
import { expect } from 'chai';
import { parse, serialize } from 'parse5';
import { html } from '../../utils.js';

import { injectBundles, createLoadScript } from '../../../src/output/injectBundles.js';

describe('createLoadScript()', () => {
  it('creates a script for es modules', () => {
    // parse5 types are broken
    const scriptAst = createLoadScript('./app.js', 'es') as any;

    expect(scriptAst.tagName).to.equal('script');
    expect(scriptAst.attrs).to.eql([
      { name: 'type', value: 'module' },
      { name: 'src', value: './app.js' },
    ]);
  });

  it('creates a script for systemjs', () => {
    // parse5 types are broken
    const scriptAst = createLoadScript('./app.js', 'system') as any;

    expect(scriptAst.tagName).to.equal('script');
    expect(getTextContent(scriptAst)).to.equal('System.import("./app.js");');
  });

  it('creates a script for other modules types', () => {
    const scriptAst = createLoadScript('./app.js', 'iife') as any;

    expect(scriptAst.tagName).to.equal('script');
    expect(scriptAst.attrs).to.eql([
      { name: 'src', value: './app.js' },
      { name: 'defer', value: '' },
    ]);
  });
});

describe('injectBundles()', () => {
  it('can inject a single bundle', () => {
    const document = parse(html`
      <html>
        <head></head>
        <body>
          <h1>Hello world</h1>
        </body>
      </html>
    `);

    injectBundles(document, [
      {
        options: { format: 'es' },
        entrypoints: [
          {
            importPath: 'app.js',
            // @ts-ignore
            chunk: {},
          },
        ],
      },
    ]);

    const htmlWithBundles = serialize(document);

    expect(html`${htmlWithBundles}`).to.eql(html`
      <html>
        <head></head>
        <body>
          <h1>Hello world</h1>
          <script type="module" src="app.js"></script>
        </body>
      </html>
    `);
  });

  it('can inject multiple bundles', () => {
    const document = parse(html`
      <html>
        <head></head>
        <body>
          <h1>Hello world</h1>
        </body>
      </html>
    `);

    injectBundles(document, [
      // @ts-ignore
      {
        options: { format: 'es' },
        entrypoints: [
          {
            importPath: './app.js',
            // @ts-ignore
            chunk: null,
          },
        ],
      },
      // @ts-ignore
      {
        options: { format: 'iife' },
        entrypoints: [
          {
            importPath: '/scripts/script.js',
            // @ts-ignore
            chunk: null,
          },
        ],
      },
    ]);

    const htmlWithBundles = serialize(document);

    expect(html`${htmlWithBundles}`).to.eql(html`
      <html>
        <head></head>
        <body>
          <h1>Hello world</h1>
          <script type="module" src="./app.js"></script>
          <script src="/scripts/script.js" defer=""></script>
        </body>
      </html>
    `);
  });
});
