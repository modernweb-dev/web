import { runTests } from '@web/test-runner-core/dist/test-helpers';

import { playwrightLauncher } from '../src/index';

it('runs tests with playwright', async function() {
  this.timeout(50000);

  await runTests(
    {
      browsers: [
        playwrightLauncher({ product: 'chromium' }),
        playwrightLauncher({ product: 'firefox' }),
        // webkit does not work in our CI
        // playwrightLauncher({ product: 'webkit' }),
      ],
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
