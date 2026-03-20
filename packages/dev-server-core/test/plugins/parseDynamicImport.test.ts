import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseDynamicImport } from '../../src/plugins/parseDynamicImport.ts';

describe('parseDynamicImport', () => {
  function testParseDynamicImport(specifier: string) {
    const code = `import(${specifier})`;
    return parseDynamicImport(code, 7, 7 + specifier.length);
  }

  it('works for " string literals', () => {
    const importStringA = '"./a.js"';
    assert.deepStrictEqual(testParseDynamicImport(importStringA), {
      importString: importStringA,
      importSpecifier: './a.js',
      concatenatedString: false,
      stringLiteral: true,
      dynamicStart: 7,
      dynamicEnd: 15,
    });

    const importStringB = '"./a/b/c.js"';
    assert.deepStrictEqual(testParseDynamicImport(importStringB), {
      importString: importStringB,
      importSpecifier: './a/b/c.js',
      concatenatedString: false,
      stringLiteral: true,
      dynamicStart: 7,
      dynamicEnd: 19,
    });

    const importStringC = '"/a/b.js"';
    assert.deepStrictEqual(testParseDynamicImport(importStringC), {
      importString: importStringC,
      importSpecifier: '/a/b.js',
      concatenatedString: false,
      stringLiteral: true,
      dynamicStart: 7,
      dynamicEnd: 16,
    });
  });

  it("works for ' string literals", () => {
    const importString = "'./a.js'";
    assert.deepStrictEqual(testParseDynamicImport(importString), {
      importString,
      importSpecifier: './a.js',
      concatenatedString: false,
      stringLiteral: true,
      dynamicStart: 7,
      dynamicEnd: 15,
    });
  });

  it('works for singlecharacter string literals', () => {
    const importString = "'a.js'";
    assert.deepStrictEqual(testParseDynamicImport(importString), {
      importString,
      importSpecifier: 'a.js',
      concatenatedString: false,
      stringLiteral: true,
      dynamicStart: 7,
      dynamicEnd: 13,
    });
  });

  it('works for ` string literals', () => {
    const importString = '`./a/b.js`';
    assert.deepStrictEqual(testParseDynamicImport(importString), {
      importString,
      importSpecifier: './a/b.js',
      concatenatedString: true,
      stringLiteral: true,
      dynamicStart: 7,
      dynamicEnd: 17,
    });
  });

  it('works for concatenated strings', () => {
    const importStringA = "'./a' + '.js'";
    assert.deepStrictEqual(testParseDynamicImport(importStringA), {
      importString: importStringA,
      importSpecifier: "./a' + '.js",
      concatenatedString: true,
      stringLiteral: true,
      dynamicStart: 7,
      dynamicEnd: 20,
    });

    const importStringB = '"./a" + "/b/" + "c.js"';
    assert.deepStrictEqual(testParseDynamicImport(importStringB), {
      importString: importStringB,
      importSpecifier: './a" + "/b/" + "c.js',
      concatenatedString: true,
      stringLiteral: true,
      dynamicStart: 7,
      dynamicEnd: 29,
    });
  });

  it('works for interpolated string literals', () => {
    const importString = '`./a/${file}.js`';
    assert.deepStrictEqual(testParseDynamicImport(importString), {
      importString,
      importSpecifier: './a/${file}.js',
      concatenatedString: true,
      stringLiteral: true,
      dynamicStart: 7,
      dynamicEnd: 23,
    });
  });

  it('works for variables', () => {
    const importString = 'foo';
    assert.deepStrictEqual(testParseDynamicImport(importString), {
      importString,
      importSpecifier: 'foo',
      concatenatedString: false,
      stringLiteral: false,
      dynamicStart: 7,
      dynamicEnd: 10,
    });
  });

  it('works for single character variables', () => {
    const importString = 'a';
    assert.deepStrictEqual(testParseDynamicImport(importString), {
      importString,
      importSpecifier: 'a',
      concatenatedString: false,
      stringLiteral: false,
      dynamicStart: 7,
      dynamicEnd: 8,
    });
  });

  it('works for variables with concatenation', () => {
    const importString = 'foo + "x.js"';
    assert.deepStrictEqual(testParseDynamicImport(importString), {
      importString,
      importSpecifier: 'foo + "x.js"',
      concatenatedString: true,
      stringLiteral: false,
      dynamicStart: 7,
      dynamicEnd: 19,
    });
  });

  it('works for string literals with spaces or newlines', () => {
    const importStringA = ' "./a.js" ';
    assert.deepStrictEqual(testParseDynamicImport(importStringA), {
      importString: '"./a.js"',
      importSpecifier: './a.js',
      concatenatedString: false,
      stringLiteral: true,
      dynamicStart: 8,
      dynamicEnd: 16,
    });

    const importStringB = '\n  "./a.js"\n  ';
    assert.deepStrictEqual(testParseDynamicImport(importStringB), {
      importString: '"./a.js"',
      importSpecifier: './a.js',
      concatenatedString: false,
      stringLiteral: true,
      dynamicStart: 10,
      dynamicEnd: 18,
    });
  });

  it('works for template strings with spaces or newlines', () => {
    const importStringA = '\n  `./x/${file}.js`\n   ';
    assert.deepStrictEqual(testParseDynamicImport(importStringA), {
      importString: '`./x/${file}.js`',
      importSpecifier: './x/${file}.js',
      concatenatedString: true,
      stringLiteral: true,
      dynamicStart: 10,
      dynamicEnd: 26,
    });
  });
});
