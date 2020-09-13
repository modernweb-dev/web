import path from 'path';
import { runTests } from '@web/test-runner-core/test-helpers';
import { chromeLauncher } from '@web/test-runner-chrome';

describe('executeServerCommand', function test() {
  this.timeout(20000);

  it('can execute commands', async () => {
    await runTests({
      files: [path.join(__dirname, 'browser-test.js')],
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
