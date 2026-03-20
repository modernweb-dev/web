import path from 'path';
import { runTests } from '@web/test-runner-core/test-helpers';
import { chromeLauncher } from '@web/test-runner-chrome';
import { Logger } from '@web/dev-server-core';

describe('executeServerCommand', function test() {
  this.timeout(20000);

  it('can execute commands', async () => {
    const logger: Logger = {
      ...console,
      debug() {
        //
      },
      error(...args) {
        if (
          typeof args[0] === 'object' &&
          typeof (args[0] as any).message === 'string' &&
          (args[0] as any).message.includes('error expected to be thrown from command')
        ) {
          return;
        }
        console.error(...args);
      },
      logSyntaxError: console.error,
    };

    await runTests({
      files: [path.join(__dirname, 'browser-test.js')],
      logger,
      browsers: [chromeLauncher()],
      plugins: [
        {
          name: 'test-a',
          async executeCommand({ command, payload }) {
            if (command === 'command-a') {
              return { foo: 'bar' };
            }

            if (command === 'command-b') {
              return (payload as any).message === 'hello world';
            }

            if (command === 'command-c') {
              return null;
            }

            if (command === 'command-d') {
              throw new Error('error expected to be thrown from command');
            }
          },
        },

        {
          name: 'test-b',
          async executeCommand({ command }) {
            if (command === 'command-c') {
              return true;
            }
          },
        },
      ],
    });
  });
});
