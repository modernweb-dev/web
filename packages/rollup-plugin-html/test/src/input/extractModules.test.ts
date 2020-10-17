import path from 'path';
import { expect } from 'chai';

import { extractModules } from '../../../src/input/extractModules';

const { sep } = path;

describe('extractModules()', () => {
  it('extracts all modules from a html document', () => {
    const { moduleImports, inlineModules, htmlWithoutModules } = extractModules(
      '<div>before</div>' +
        '<script type="module" src="./foo.js"></script>' +
        '<script type="module" src="/bar.js"></script>' +
        '<div>after</div>',
      '/',
      '/',
    );

    expect(inlineModules.size).to.equal(0);
    expect(moduleImports).to.eql([`${sep}foo.js`, `${sep}bar.js`]);
    expect(htmlWithoutModules).to.eql(
      '<html><head></head><body><div>before</div><div>after</div></body></html>',
    );
  });

  it('resolves imports relative to the root dir', () => {
    const { moduleImports, inlineModules, htmlWithoutModules } = extractModules(
      '<div>before</div>' +
        '<script type="module" src="./foo.js"></script>' +
        '<script type="module" src="/bar.js"></script>' +
        '<div>after</div>',
      '/',
      '/base/',
    );

    expect(inlineModules.size).to.equal(0);
    expect(moduleImports).to.eql([`${sep}foo.js`, `${sep}base${sep}bar.js`]);
    expect(htmlWithoutModules).to.eql(
      '<html><head></head><body><div>before</div><div>after</div></body></html>',
    );
  });

  it('resolves relative imports relative to the relative import base', () => {
    const { moduleImports, inlineModules, htmlWithoutModules } = extractModules(
      '<div>before</div>' +
        '<script type="module" src="./foo.js"></script>' +
        '<script type="module" src="/bar.js"></script>' +
        '<div>after</div>',
      '/base-1/base-2/',
      '/base-1/',
    );

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
    const { moduleImports, inlineModules, htmlWithoutModules } = extractModules(
      '<div>before</div>' +
        '<script type="module">/* my module 1 */</script>' +
        '<script type="module">/* my module 2 */</script>' +
        '<div>after</div>',
      '/',
      '/',
    );

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
    const { moduleImports, inlineModules, htmlWithoutModules } = extractModules(
      '<div>before</div>' +
        '<script type="module">/* my module 1 */</script>' +
        '<script type="module">/* my module 2 */</script>' +
        '<div>after</div>',
      '/foo/bar/',
      '/',
    );

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
