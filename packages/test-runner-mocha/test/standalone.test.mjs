import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { runTests } from '@web/test-runner-core/test-helpers';
import { chromeLauncher } from '@web/test-runner-chrome';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('standalone', () => {
  it('can run tests with standalone', { timeout: 50000 }, async () => {
    const { sessions } = await runTests(
      {
        files: [resolve(__dirname, 'fixtures', 'standalone.html')],
        browsers: [chromeLauncher()],
        concurrency: 10,
      },
      [],
      { allowFailure: true, reportErrors: false },
    );

    assert.strictEqual(sessions.length, 1);
    assert.strictEqual(sessions[0].passed, false);

    assert.strictEqual(sessions[0].testResults.tests.length, 2);
    assert.strictEqual(sessions[0].testResults.tests[0].name, 'test 1');
    assert.strictEqual(sessions[0].testResults.tests[0].passed, true);
    assert.strictEqual(sessions[0].testResults.tests[1].name, 'test 2');
    assert.strictEqual(sessions[0].testResults.tests[1].passed, false);
    assert.strictEqual(sessions[0].testResults.tests[1].error.message, 'test 2 error');

    assert.strictEqual(sessions[0].testResults.suites.length, 1);
    assert.strictEqual(sessions[0].testResults.suites[0].tests.length, 2);
    assert.strictEqual(sessions[0].testResults.suites[0].tests[0].name, 'test a 1');
    assert.strictEqual(sessions[0].testResults.suites[0].tests[0].passed, true);
    assert.strictEqual(sessions[0].testResults.suites[0].tests[1].name, 'test a 2');
    assert.strictEqual(sessions[0].testResults.suites[0].tests[1].passed, false);
    assert.strictEqual(sessions[0].testResults.suites[0].tests[1].error.message, 'test a 2 error');

    assert.strictEqual(sessions[0].testResults.suites[0].suites.length, 1);
    assert.strictEqual(sessions[0].testResults.suites[0].suites[0].tests.length, 2);
    assert.strictEqual(sessions[0].testResults.suites[0].suites[0].tests[0].name, 'test b 1');
    assert.strictEqual(sessions[0].testResults.suites[0].suites[0].tests[0].passed, true);
    assert.strictEqual(sessions[0].testResults.suites[0].suites[0].tests[1].name, 'test b 2');
    assert.strictEqual(sessions[0].testResults.suites[0].suites[0].tests[1].passed, true);
  });

  it('captures errors during setup', { timeout: 50000 }, async () => {
    const { sessions } = await runTests(
      {
        files: [resolve(__dirname, 'fixtures', 'standalone-setup-fail.html')],
        browsers: [chromeLauncher()],
        concurrency: 10,
      },
      [],
      { allowFailure: true, reportErrors: false },
    );

    assert.strictEqual(sessions.length, 1);
    assert.strictEqual(sessions[0].passed, false);
    assert.strictEqual(sessions[0].errors.length, 1);
    assert.strictEqual(sessions[0].errors[0].message, 'error during setup');
  });
});
