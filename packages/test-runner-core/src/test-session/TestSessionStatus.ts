export type TestSessionStatus = 'SCHEDULED' | 'INITIALIZING' | 'STARTED' | 'FINISHED';

export const SESSION_STATUS = {
  // waiting for a browser to free up and run this test session
  SCHEDULED: 'SCHEDULED' as TestSessionStatus,

  // browser is booting up, waiting to ping back that it's starting
  INITIALIZING: 'INITIALIZING' as TestSessionStatus,

  // browser has started, running the actual tests
  STARTED: 'STARTED' as TestSessionStatus,

  // finished running tests
  FINISHED: 'FINISHED' as TestSessionStatus,
};
