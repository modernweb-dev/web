import { runTests } from '@web/test-runner-core/test-helpers';
import { resolve } from 'path';
import { chromeLauncher } from '../src/index';

it('runs tests with chrome', async function () {
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
    browsers: [chromeLauncher()],
    concurrency: 3,
  });
});
