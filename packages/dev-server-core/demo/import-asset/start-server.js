const open = require('open');
const { DevServer } = require('../../dist/index');

const server = new DevServer(
  {
    port: 8080,
    rootDir: process.cwd(),
    plugins: [
      {
        name: 'import-asset',
        resolveImport({ source }) {
          if (source.endsWith('.png')) {
            return `${source}?import-asset=true`;
          }
        },

        serve(context) {
          if (context.URL.searchParams.get('import-asset') === 'true') {
            return { body: `export default ${JSON.stringify(context.path)}`, type: 'js' };
          }
        },
      },
    ],
    middleware: [],
  },
  {
    log: console.log,
    debug: () => {
      // no debug
    },
    error: console.error,
    warn: console.warn,
    logSyntaxError(error) {
      console.error(error.message);
    },
  },
);

server.start();
open('http://localhost:8080/demo/import-asset/');
