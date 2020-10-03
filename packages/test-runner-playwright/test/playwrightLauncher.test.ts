import { runTests } from '@web/test-runner-core/test-helpers';
import { resolve } from 'path';
import os from 'os';

import { playwrightLauncher } from '../src/index';

it('runs tests with playwright', async function () {
  this.timeout(50000);

  await runTests({
    files: [
      resolve(__dirname, 'fixtures', 'a.js'),
      resolve(__dirname, 'fixtures', 'b.js'),
      resolve(__dirname, 'fixtures', 'c.js'),
      resolve(__dirname, 'fixtures', 'd.js'),
      resolve(__dirname, 'fixtures', 'e.js'),
      resolve(__dirname, 'fixtures', 'f.js'),
      resolve(__dirname, 'fixtures', 'g.js'),
    ],
    browsers: [
      playwrightLauncher({ product: 'chromium' }),
      playwrightLauncher({ product: 'firefox' }),
      ...(os.platform() === 'win32' ? [] : [playwrightLauncher({ product: 'webkit' })]),
    ],
  });
});
