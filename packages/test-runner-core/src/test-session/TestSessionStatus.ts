export type TestSessionStatus = 'SCHEDULED' | 'INITIALIZING' | 'STARTED' | 'FINISHED';

export const SESSION_STATUS = {
  // waiting for a browser to free up and run this test session
  SCHEDULED: 'SCHEDULED' as TestSessionStatus,

  // browser is booting up, waiting to ping back that it's starting
  INITIALIZING: 'INITIALIZING' as TestSessionStatus,

  // browser has started, running the actual tests
  TEST_STARTED: 'TEST_STARTED' as TestSessionStatus,

  // browser has collected the test results, but not yet results, logs or coverage
  TEST_FINISHED: 'TEST_FINISHED' as TestSessionStatus,

  // finished running tests and collecting tests results, logs, coverage etc.
  FINISHED: 'FINISHED' as TestSessionStatus,
};
