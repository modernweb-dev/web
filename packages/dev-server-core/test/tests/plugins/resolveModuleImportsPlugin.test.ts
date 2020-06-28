import { expect } from 'chai';
import fetch from 'node-fetch';

import { resolveModuleImports } from '../../../src/plugins/resolveModuleImportsPlugin';
import { createTestServer } from '../helpers';

const defaultFilePath = '/root/my-file.js';
const defaultResolveImport = (src: string) => `RESOLVED__${src}`;

describe('resolveModuleImports()', () => {
  it('resolves regular imports', async () => {
    const result = await resolveModuleImports(
      [
        'import "my-module";',
        'import foo from "my-module";',
        'import { bar } from "my-module";',
        'import "./my-module.js";',
        'import "https://my-cdn.com/my-package.js";',
      ].join('\n'),
      defaultFilePath,
      defaultResolveImport,
    );

    expect(result.split('\n')).to.eql([
      'import "RESOLVED__my-module";',
      'import foo from "RESOLVED__my-module";',
      'import { bar } from "RESOLVED__my-module";',
      'import "RESOLVED__./my-module.js";',
      'import "RESOLVED__https://my-cdn.com/my-package.js";',
    ]);
  });

  it('resolves basic exports', async () => {
    const result = await resolveModuleImports(
      [
        //
        "export * from 'my-module';",
        "export { foo } from 'my-module';",
      ].join('\n'),
      defaultFilePath,
      defaultResolveImport,
    );

    expect(result.split('\n')).to.eql([
      //
      "export * from 'RESOLVED__my-module';",
      "export { foo } from 'RESOLVED__my-module';",
    ]);
  });

  it('resolves imports to a file with bare import', async () => {
    const result = await resolveModuleImports(
      "import 'my-module/bar/index.js'",
      defaultFilePath,
      defaultResolveImport,
    );

    expect(result).to.eql("import 'RESOLVED__my-module/bar/index.js");
  });

  it('resolves dynamic imports', async () => {
    const result = await resolveModuleImports(
      [
        'function lazyLoad() { return import("my-module-2"); }',
        'import("my-module");',
        'import("./local-module.js");',
      ].join('\n'),
      defaultFilePath,
      defaultResolveImport,
    );

    expect(result.split('\n')).to.eql([
      'function lazyLoad() { return import("RESOLVED__my-module-2"); }',
      'import("RESOLVED__my-module");',
      'import("RESOLVED__./local-module.js");',
    ]);
  });

  it('does not touch import.meta.url', async () => {
    const result = await resolveModuleImports(
      [
        //
        'console.log(import.meta.url);',
        "import 'my-module';",
      ].join('\n'),
      defaultFilePath,
      defaultResolveImport,
    );

    expect(result.split('\n')).to.eql([
      'console.log(import.meta.url);',
      "import 'RESOLVED__my-module';",
    ]);
  });

  it('does not touch comments', async () => {
    const result = await resolveModuleImports(
      [
        //
        "import 'my-module';",
        "// Example: import('my-module');",
      ].join('\n'),
      defaultFilePath,
      defaultResolveImport,
    );

    expect(result.split('\n')).to.eql([
      "import 'RESOLVED__my-module';",
      "// Example: import('my-module');",
    ]);
  });

  it('does not resolve imports in regular code', async () => {
    const result = await resolveModuleImports(
      [
        //
        'function myimport() { }',
        'function my_import() { }',
        'function importShim() { }',
        "class Foo { import() { return 'foo' } }",
      ].join('\n'),
      defaultFilePath,
      defaultResolveImport,
    );

    expect(result.split('\n')).to.eql([
      'function myimport() { }',
      'function my_import() { }',
      'function importShim() { }',
      "class Foo { import() { return 'foo' } }",
    ]);
  });

  it('resolves the package of dynamic imports with string concatenation', async () => {
    const result = await resolveModuleImports(
      [
        //
        'import(`@namespace/my-module-3/dynamic-files/${file}.js`);',
        'import(`my-module/dynamic-files/${file}.js`);',
        'import("my-module/dynamic-files" + "/" + file + ".js");',
        'import("my-module/dynamic-files/" + file + ".js");',
        'import("my-module/dynamic-files".concat(file).concat(".js"));',
      ].join('\n'),
      defaultFilePath,
      defaultResolveImport,
    );

    expect(result.split('\n')).to.eql([
      'import(`RESOLVED__@namespace/my-module-3/dynamic-files/${file}.js`);',
      'import(`RESOLVED__my-module/dynamic-files/${file}.js`);',
      'import("RESOLVED__my-module/dynamic-files" + "/" + file + ".js");',
      'import("RESOLVED__my-module/dynamic-files/" + file + ".js");',
      'import("RESOLVED__my-module/dynamic-files".concat(file).concat(".js"));',
    ]);
  });

  it('does not change import with string concatenation cannot be resolved', async () => {
    await resolveModuleImports(
      [
        'const file = "a";',
        'import(`@namespace/non-existing/dynamic-files/${file}.js`);',
        'import(`non-existing/dynamic-files/${file}.js`);',
        'import(totallyDynamic);',
        'import(`${file}.js`);',
      ].join('\n'),
      defaultFilePath,
      defaultResolveImport,
    );
  });

  it('does not change import with string concatenation cannot be resolved', async () => {
    await resolveModuleImports(
      [
        'const file = "a";',
        'import(`@namespace/non-existing/dynamic-files/${file}.js`);',
        'import(`non-existing/dynamic-files/${file}.js`);',
        'import(totallyDynamic);',
        'import(`${file}.js`);',
      ].join('\n'),
      defaultFilePath,
      defaultResolveImport,
    );
  });

  it('throws a syntax error on invalid imports', async () => {
    let thrown = false;

    try {
      await resolveModuleImports('\n\nconst file = "a', defaultFilePath, defaultResolveImport);
    } catch (error) {
      thrown = true;
      expect(error.message).to.equal('Syntax error');
      expect(error.location).to.eql({
        file: '/root/my-file.js',
        column: 3,
        line: 16,
      });
    }

    expect(thrown).to.be.true;
  });
});

describe('resolveModuleImportsPlugin', () => {
  it('lets plugins resolve imports using the resolveImport hook', async () => {
    const { server, host } = await createTestServer({
      plugins: [
        {
          name: 'test',
          resolveImport({ source }) {
            return `RESOLVED__${source}`;
          },
        },
      ],
    });

    try {
      const response = await fetch(`${host}/src/app.js`);
      const responseText = await response.text();

      expect(response.status).to.equal(200);
      expect(responseText).to.include("import { message } from 'RESOLVED__my-module';");
    } finally {
      server.stop();
    }
  });

  it('resolves imports in inline modules in HTML files', async () => {
    const { server, host } = await createTestServer({
      plugins: [
        {
          name: 'test',
          resolveImport({ source }) {
            return `RESOLVED__${source}`;
          },
        },
      ],
    });

    try {
      const response = await fetch(`${host}/index.html`);
      const responseText = await response.text();

      expect(response.status).to.equal(200);
      expect(responseText).to.include("import { message } from 'RESOLVED__my-module';");
    } finally {
      server.stop();
    }
  });

  it('unmatched resolve leaves import untouched', async () => {
    const { server, host } = await createTestServer({
      plugins: [
        {
          name: 'test',
          resolveImport() {
            return undefined;
          },
        },
      ],
    });

    try {
      const response = await fetch(`${host}/src/app.js`);
      const responseText = await response.text();

      expect(response.status).to.equal(200);
      expect(responseText).to.include("import { message } from 'my-module';");
    } finally {
      server.stop();
    }
  });

  it('first matching plugin takes priority', async () => {
    const { server, host } = await createTestServer({
      plugins: [
        {
          name: 'test-a',
          resolveImport({ source, context }) {
            if (context.path === '/src/foo.js') {
              return `RESOLVED__A__${source}`;
            }
          },
        },
        {
          name: 'test-b',
          resolveImport({ source }) {
            return `RESOLVED__B__${source}`;
          },
        },
      ],
    });

    try {
      const responseA = await fetch(`${host}/src/foo.js`);
      const responseB = await fetch(`${host}/src/app.js`);
      const responseTextA = await responseA.text();
      const responseTextB = await responseB.text();

      expect(responseA.status).to.equal(200);
      expect(responseB.status).to.equal(200);
      expect(responseTextA).to.include("import { message } from 'RESOLVED__A__my-module';");
      expect(responseTextB).to.include("import { message } from 'RESOLVED__B__my-module';");
    } finally {
      server.stop();
    }
  });
});
