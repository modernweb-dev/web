import path from 'path';
// import { platform } from 'os';
import { runTests } from '@web/test-runner-core/test-helpers';
import { chromeLauncher } from '@web/test-runner-chrome';
// import { playwrightLauncher } from '@web/test-runner-playwright';
import { visualRegressionPlugin } from '@web/test-runner-visual-regression/plugin';

import { emulateHoverPlugin } from '../../src/emulateHoverPlugin';

describe('emulateHoverPlugin', function test() {
  this.timeout(20000);

  it('can emulate hover on puppeteer', async () => {
    await runTests({
      files: [
        path.join(__dirname, 'browser-test.js')
      ],
      browsers: [chromeLauncher()],
      plugins: [
        {
          name: 'resolve-commands',
          resolveImport({ source }) {
            if (source === '@web/test-runner-visual-regression') {
              return '/packages/test-runner-visual-regression/browser/commands.mjs';
            }

            if (source === '@web/test-runner-commands') {
              return '/packages/test-runner-commands/browser/commands.mjs';
            }
          },
        },
        emulateHoverPlugin(),
        visualRegressionPlugin({
          baseDir: 'packages/test-runner-commands/test/emulate-hover/screenshots',
          update: process.argv.includes('--update-visual-diffs'),
        })
      ],
    });
  });

  // // playwright doesn't work on windows VM right now
  // if (platform() !== 'win32') {
  //   it('can emulate media on playwright', async () => {
  //     await runTests({
  //       files: [
  //         path.join(__dirname, 'browser-test.js'),
  //         path.join(__dirname, 'prefers-reduced-motion-test.js'),
  //       ],
  //       browsers: [
  //         playwrightLauncher({ product: 'chromium' }),
  //         playwrightLauncher({ product: 'firefox' }),
  //         playwrightLauncher({ product: 'webkit' }),
  //       ],
  //       plugins: [emulateHoverPlugin()],
  //     });
  //   });
  // }
});
