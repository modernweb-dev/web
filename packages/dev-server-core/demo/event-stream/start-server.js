const open = require('open');
const { DevServer } = require('../../dist/index');

const server = new DevServer(
  {
    port: 8080,
    rootDir: process.cwd(),
    plugins: [
      {
        name: 'test',
        injectEventStream: true,
        serverStart({ eventStreams }) {
          let i = 0;
          setInterval(() => {
            eventStreams.sendMessageEvent(`Hello ${i}`);
            i += 1;
          }, 1100);
        },
      },
    ],
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
open('http://localhost:8080/demo/event-stream/');
