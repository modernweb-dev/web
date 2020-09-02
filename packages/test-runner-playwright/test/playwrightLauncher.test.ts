import { runTests } from '@web/test-runner-core/test-helpers';
import { resolve } from 'path';

import { playwrightLauncher } from '../src/index';

it.skip('runs tests with playwright', async function () {
  this.timeout(50000);

  await runTests(
    {
      browsers: [
        playwrightLauncher({ product: 'chromium' }),
        playwrightLauncher({ product: 'firefox' }),
        playwrightLauncher({ product: 'webkit' }),
      ],
      concurrency: 3,
    },
    [
      resolve(__dirname, 'fixtures', 'a.js'),
      resolve(__dirname, 'fixtures', 'b.js'),
      resolve(__dirname, 'fixtures', 'c.js'),
      resolve(__dirname, 'fixtures', 'd.js'),
      resolve(__dirname, 'fixtures', 'e.js'),
      resolve(__dirname, 'fixtures', 'f.js'),
      resolve(__dirname, 'fixtures', 'g.js'),
    ],
  );
});
