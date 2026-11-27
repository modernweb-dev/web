const { DevServer } = require('../../dist/index');

const server = new DevServer(
  {
    port: 8080,
    rootDir: process.cwd(),
    http2: true,
    plugins: [],
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
  openBrowser('https://localhost:8080/demo/http2/');
});
