import { runTests } from '@web/test-runner-core/dist/test-helpers';

import { puppeteerLauncher } from '../src/puppeteerLauncher';

it('runs tests with puppeteer', async function() {
  this.timeout(50000);

  await runTests(
    {
      browsers: [puppeteerLauncher()],
      // firefox doesn't work in our CI
      // browsers: [puppeteerLauncher({ launchOptions: { product: 'firefox' } })],
      concurrency: 3,
    },
    [
      'test/fixtures/test-a.test.js',
      'test/fixtures/test-b.test.js',
      'test/fixtures/test-c.test.js',
      'test/fixtures/test-d.test.js',
      'test/fixtures/test-e.test.js',
      'test/fixtures/test-f.test.js',
      'test/fixtures/test-g.test.js',
    ],
  );
});
