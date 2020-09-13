import { runTests } from '@web/test-runner-core/test-helpers';
import { resolve } from 'path';

import { puppeteerLauncher } from '../src/puppeteerLauncher';

it('runs tests with puppeteer', async function () {
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
    browsers: [puppeteerLauncher()],
    // firefox doesn't work in our CI
    // browsers: [puppeteerLauncher({ launchOptions: { product: 'firefox' } })],
    concurrency: 3,
  });
});
