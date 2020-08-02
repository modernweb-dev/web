import { BasicTestSession } from './BasicTestSession';

export interface DebugTestSession extends BasicTestSession {
  debug: true;
}
