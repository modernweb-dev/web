import { runTests } from '@web/test-runner-core/test-helpers';
import assert from 'node:assert/strict';
import path from 'node:path';
import { it } from 'node:test';
import { chromeLauncher } from '../dist/index.js';

it('maps error stacks with source maps', async () => {
  const { sessions } = await runTests(
    {
      files: [path.join(import.meta.dirname, 'fixtures', 'source-map', 'mapped.test.js')],
      browsers: [chromeLauncher()],
    },
    undefined,
    { allowFailure: true, reportErrors: false },
  );

  const { stack } = sessions[0].testResults!.tests[0].error!;
  assert.match(stack!, /mapped\.ts:12:/);
});
