const { DevServer } = require('../../dist/index');

const server = new DevServer(
  {
    port: 8080,
    rootDir: process.cwd(),
    plugins: [],
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

server.start().then(async () => {
  const { openBrowser } = await import('@web/dev-server-core');
  openBrowser('http://localhost:8080/demo/basic/');
});
