import { TestSessionResult } from './TestSessionResult';
import { TestSessionStatus } from './TestSessionStatus';

export interface TestSession {
  id: string;
  testRun: number;
  browserName: string;
  testFile: string;
  status: TestSessionStatus;
  result?: TestSessionResult;
}
