import { expect } from 'chai';

import { transformImports } from '../../src/plugins/transformModuleImportsPlugin.js';
import type { PluginSyntaxError } from '../../src/logger/PluginSyntaxError.js';
import { createTestServer } from '../helpers.js';

const defaultFilePath = '/root/my-file.js';
const defaultResolveImport = (src: string) => `RESOLVED__${src}`;

describe('transformImports()', () => {
  it('resolves regular imports', async () => {
    const result = await transformImports(
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
    const result = await transformImports(
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
    const result = await transformImports(
      "import 'my-module/bar/index.js'",
      defaultFilePath,
      defaultResolveImport,
    );

    expect(result).to.eql("import 'RESOLVED__my-module/bar/index.js");
  });

  it('resolves dynamic imports', async () => {
    const result = await transformImports(
      [
        'import("/bar.js");',
        // 'function lazyLoad() { return import("my-module-2"); }',
        // 'import("my-module");',
        // 'import("./local-module.js");',
      ].join('\n'),
      defaultFilePath,
      defaultResolveImport,
    );

    expect(result.split('\n')).to.eql([
      'import("RESOLVED__/bar.js");',
      // 'function lazyLoad() { return import("RESOLVED__my-module-2"); }',
      // 'import("RESOLVED__my-module");',
      // 'import("RESOLVED__./local-module.js");',
    ]);
  });

  it('does not touch import.meta.url', async () => {
    const result = await transformImports(
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
    const result = await transformImports(
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
    const result = await transformImports(
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

  it('resolves the package of bare dynamic imports with string concatenation', async () => {
    const result = await transformImports(
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

  it('resolves dynamic imports', async () => {
    const result = await transformImports(
      [
        //
        'import("./a.js");',
        "import('./b.js');",
      ].join('\n'),
      defaultFilePath,
      defaultResolveImport,
    );

    expect(result.split('\n')).to.eql([
      'import("RESOLVED__./a.js");',
      "import('RESOLVED__./b.js');",
    ]);
  });

  it('does not get confused by whitespace', async () => {
    const result = await transformImports(
      [
        //
        'import( "./a.js" );',
        'import(   "./b.js"   );',
        'import(   "./c"   +    ".js"   );',
        `import(
              './d.js'
        );`,
      ].join('\n'),
      defaultFilePath,
      defaultResolveImport,
    );
    expect(result.split('\n')).to.eql([
      'import( "RESOLVED__./a.js" );',
      'import(   "RESOLVED__./b.js"   );',
      'import(   "./c"   +    ".js"   );',
      'import(',
      "              'RESOLVED__./d.js'",
      '        );',
    ]);
  });

  it('does not change import with string concatenation cannot be resolved', async () => {
    await transformImports(
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
    await transformImports(
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

  it('does not resolve dynamic imports with string concatenation', async () => {
    const result = await transformImports(
      [
        //
        'import(`./foo/${file}.js`);',
        'import(`/${file}.js`);',
        'import("./foo" + "/" + file + ".js");',
        'import(file + ".js");',
        'import(file);',
        'import("./foo".concat(file).concat(".js"));',
      ].join('\n'),
      defaultFilePath,
      defaultResolveImport,
    );

    expect(result.split('\n')).to.eql([
      'import(`./foo/${file}.js`);',
      'import(`/${file}.js`);',
      'import("./foo" + "/" + file + ".js");',
      'import(file + ".js");',
      'import(file);',
      'import("./foo".concat(file).concat(".js"));',
    ]);
  });

  it('throws a syntax error on invalid imports', async () => {
    let thrown = false;

    try {
      await transformImports('\n\nconst file = "a', defaultFilePath, defaultResolveImport);
    } catch (error) {
      thrown = true;
      expect((error as PluginSyntaxError).message).to.equal('Syntax error');
      expect((error as PluginSyntaxError).filePath).to.equal('/root/my-file.js');
      expect((error as PluginSyntaxError).column).to.equal(16);
      expect((error as PluginSyntaxError).line).to.equal(3);
    }

    expect(thrown).to.be.true;
  });
});

describe('resolveImport', () => {
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

describe('transformImport', () => {
  it('can transform imports', async () => {
    const { server, host } = await createTestServer({
      plugins: [
        {
          name: 'test',
          transformImport({ source }) {
            return `${source}?transformed-1`;
          },
        },
      ],
    });

    try {
      const response = await fetch(`${host}/src/app.js`);
      const responseText = await response.text();

      expect(response.status).to.equal(200);
      expect(responseText).to.include("import { message } from 'my-module?transformed-1';");
      expect(responseText).to.include('./src/local-module.js?transformed-1');
    } finally {
      server.stop();
    }
  });

  it('multiple plugins can transform an import', async () => {
    const { server, host } = await createTestServer({
      plugins: [
        {
          name: 'test-1',
          transformImport({ source }) {
            return `${source}?transformed-1`;
          },
        },
        {
          name: 'test-2',
          transformImport({ source }) {
            return `${source}&transformed-2`;
          },
        },
      ],
    });

    try {
      const response = await fetch(`${host}/src/app.js`);
      const responseText = await response.text();

      expect(response.status).to.equal(200);
      expect(responseText).to.include(
        "import { message } from 'my-module?transformed-1&transformed-2';",
      );
      expect(responseText).to.include('./src/local-module.js?transformed-1&transformed-2');
    } finally {
      server.stop();
    }
  });

  it('returning undefined does not overwrite result', async () => {
    const { server, host } = await createTestServer({
      plugins: [
        {
          name: 'test-1',
          transformImport({ source }) {
            return `${source}?transformed-1`;
          },
        },
        {
          name: 'test-2',
          transformImport() {
            return undefined;
          },
        },
        {
          name: 'test-3',
          transformImport({ source }) {
            return `${source}&transformed-2`;
          },
        },
      ],
    });

    try {
      const response = await fetch(`${host}/src/app.js`);
      const responseText = await response.text();

      expect(response.status).to.equal(200);
      expect(responseText).to.include(
        "import { message } from 'my-module?transformed-1&transformed-2';",
      );
      expect(responseText).to.include('./src/local-module.js?transformed-1&transformed-2');
    } finally {
      server.stop();
    }
  });

  it('transform comes after resolving imports', async () => {
    const receivedImports: string[] = [];
    const { server, host } = await createTestServer({
      plugins: [
        {
          name: 'test-1',
          resolveImport({ source }) {
            return `RESOLVED__${source}`;
          },
        },
        {
          name: 'test-2',
          transformImport({ source }) {
            receivedImports.push(source);
          },
        },
      ],
    });

    try {
      await fetch(`${host}/src/app.js`);

      expect(receivedImports).to.eql(['RESOLVED__my-module', 'RESOLVED__./src/local-module.js']);
    } finally {
      server.stop();
    }
  });
});
