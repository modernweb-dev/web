import path from 'path';
import { parse, serialize } from 'parse5';
import { expect } from 'chai';

import { extractModules } from '../../../../src/input/extract/extractModules';

const { sep } = path;

describe('extractModules()', () => {
  it('extracts all modules from a html document', () => {
    const document = parse(
      '<div>before</div>' +
        '<script type="module" src="./foo.js"></script>' +
        '<script type="module" src="/bar.js"></script>' +
        '<div>after</div>',
    );

    const { moduleImports, inlineModules } = extractModules({
      document,
      htmlDir: '/',
      rootDir: '/',
    });
    const htmlWithoutModules = serialize(document);

    expect(inlineModules.size).to.equal(0);
    expect(moduleImports).to.eql([`${sep}foo.js`, `${sep}bar.js`]);
    expect(htmlWithoutModules).to.eql(
      '<html><head></head><body><div>before</div><div>after</div></body></html>',
    );
  });

  it('does not touch non module scripts', () => {
    const document = parse(
      '<div>before</div>' +
        '<script src="./foo.js"></script>' +
        '<script></script>' +
        '<div>after</div>',
    );

    const { moduleImports, inlineModules } = extractModules({
      document,
      htmlDir: '/',
      rootDir: '/',
    });
    const htmlWithoutModules = serialize(document);

    expect(inlineModules.size).to.equal(0);
    expect(moduleImports).to.eql([]);
    expect(htmlWithoutModules).to.eql(
      '<html><head></head><body><div>before</div><script src="./foo.js"></script><script></script><div>after</div></body></html>',
    );
  });

  it('resolves imports relative to the root dir', () => {
    const document = parse(
      '<div>before</div>' +
        '<script type="module" src="./foo.js"></script>' +
        '<script type="module" src="/bar.js"></script>' +
        '<div>after</div>',
    );

    const { moduleImports, inlineModules } = extractModules({
      document,
      htmlDir: '/',
      rootDir: '/base/',
    });
    const htmlWithoutModules = serialize(document);

    expect(inlineModules.size).to.equal(0);
    expect(moduleImports).to.eql([`${sep}foo.js`, `${sep}base${sep}bar.js`]);
    expect(htmlWithoutModules).to.eql(
      '<html><head></head><body><div>before</div><div>after</div></body></html>',
    );
  });

  it('resolves relative imports relative to the relative import base', () => {
    const document = parse(
      '<div>before</div>' +
        '<script type="module" src="./foo.js"></script>' +
        '<script type="module" src="/bar.js"></script>' +
        '<div>after</div>',
    );

    const { moduleImports, inlineModules } = extractModules({
      document,
      htmlDir: '/base-1/base-2/',
      rootDir: '/base-1/',
    });
    const htmlWithoutModules = serialize(document);

    expect(inlineModules.size).to.equal(0);
    expect(moduleImports).to.eql([
      `${sep}base-1${sep}base-2${sep}foo.js`,
      `${sep}base-1${sep}bar.js`,
    ]);
    expect(htmlWithoutModules).to.eql(
      '<html><head></head><body><div>before</div><div>after</div></body></html>',
    );
  });

  it('extracts all inline modules from a html document', () => {
    const document = parse(
      '<div>before</div>' +
        '<script type="module">/* my module 1 */</script>' +
        '<script type="module">/* my module 2 */</script>' +
        '<div>after</div>',
    );

    const { moduleImports, inlineModules } = extractModules({
      document,
      htmlDir: '/',
      rootDir: '/',
    });
    const htmlWithoutModules = serialize(document);

    expect([...inlineModules.entries()]).to.eql([
      ['/inline-module-a4e60958bc83128660775c2820e18b97.js', '/* my module 1 */'],
      ['/inline-module-37f6fef1c772a592e6764b98a0d799dd.js', '/* my module 2 */'],
    ]);
    expect(moduleImports).to.eql([]);
    expect(htmlWithoutModules).to.eql(
      '<html><head></head><body><div>before</div><div>after</div></body></html>',
    );
  });

  it('prefixes inline module with index.html directory', () => {
    const document = parse(
      '<div>before</div>' +
        '<script type="module">/* my module 1 */</script>' +
        '<script type="module">/* my module 2 */</script>' +
        '<div>after</div>',
    );

    const { moduleImports, inlineModules } = extractModules({
      document,
      htmlDir: '/foo/bar/',
      rootDir: '/',
    });
    const htmlWithoutModules = serialize(document);

    expect([...inlineModules.entries()]).to.eql([
      ['/foo/bar/inline-module-a4e60958bc83128660775c2820e18b97.js', '/* my module 1 */'],
      ['/foo/bar/inline-module-37f6fef1c772a592e6764b98a0d799dd.js', '/* my module 2 */'],
    ]);
    expect(moduleImports).to.eql([]);
    expect(htmlWithoutModules).to.eql(
      '<html><head></head><body><div>before</div><div>after</div></body></html>',
    );
  });
});
