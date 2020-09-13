const { runTests } = require('@web/test-runner-core/test-helpers');
const { chromeLauncher } = require('@web/test-runner-chrome');
const { resolve } = require('path');
const { expect } = require('chai');

it('can run tests with standalone', async function () {
  this.timeout(50000);

  const results = await runTests(
    {
      files: [resolve(__dirname, 'fixtures', 'standalone.html')],
      browsers: [chromeLauncher()],
      concurrency: 10,
    },
    [],
    { allowFailure: true, reportErrors: false },
  );

  const sessions = Array.from(results.sessions.all());
  expect(sessions.length).to.equal(1);
  expect(sessions[0].passed).to.equal(false);

  expect(sessions[0].testResults.tests.length).to.equal(2);
  expect(sessions[0].testResults.tests[0].name).to.equal('test 1');
  expect(sessions[0].testResults.tests[0].passed).to.equal(true);
  expect(sessions[0].testResults.tests[1].name).to.equal('test 2');
  expect(sessions[0].testResults.tests[1].passed).to.equal(false);
  expect(sessions[0].testResults.tests[1].error.message).to.equal('test 2 error');

  expect(sessions[0].testResults.suites.length).to.equal(1);
  expect(sessions[0].testResults.suites[0].tests.length).to.equal(2);
  expect(sessions[0].testResults.suites[0].tests[0].name).to.equal('test a 1');
  expect(sessions[0].testResults.suites[0].tests[0].passed).to.equal(true);
  expect(sessions[0].testResults.suites[0].tests[1].name).to.equal('test a 2');
  expect(sessions[0].testResults.suites[0].tests[1].passed).to.equal(false);
  expect(sessions[0].testResults.suites[0].tests[1].error.message).to.equal('test a 2 error');

  expect(sessions[0].testResults.suites[0].suites.length).to.equal(1);
  expect(sessions[0].testResults.suites[0].suites[0].tests.length).to.equal(2);
  expect(sessions[0].testResults.suites[0].suites[0].tests[0].name).to.equal('test b 1');
  expect(sessions[0].testResults.suites[0].suites[0].tests[0].passed).to.equal(true);
  expect(sessions[0].testResults.suites[0].suites[0].tests[1].name).to.equal('test b 2');
  expect(sessions[0].testResults.suites[0].suites[0].tests[1].passed).to.equal(true);
});

it('captures errors during setup', async function () {
  this.timeout(50000);

  const results = await runTests(
    {
      files: [resolve(__dirname, 'fixtures', 'standalone-setup-fail.html')],
      browsers: [chromeLauncher()],
      concurrency: 10,
    },
    [],
    { allowFailure: true, reportErrors: false },
  );

  const sessions = Array.from(results.sessions.all());
  expect(sessions.length).to.equal(1);
  expect(sessions[0].passed).to.equal(false);
  expect(sessions[0].errors.length).to.equal(1);
  expect(sessions[0].errors[0].message).to.equal('error during setup');
});
