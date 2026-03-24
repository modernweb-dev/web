import { type BasicTestSession } from './BasicTestSession.ts';

export interface DebugTestSession extends BasicTestSession {
  debug: true;
}
