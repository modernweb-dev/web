import path from 'path';
import { runTests } from '@web/test-runner-core/dist/test-helpers';
import { chromeLauncher } from '@web/test-runner-chrome';
import { testRunnerServer } from '@web/test-runner-server';

describe('executeServerCommand', function test() {
  this.timeout(20000);

  it('can execute commands', async () => {
    await runTests(
      {
        browsers: [chromeLauncher()],
        server: testRunnerServer({
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
                  throw new Error('error from command');
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
        }),
      },
      [path.join(__dirname, 'browser-test.js')],
    );
  });
});
