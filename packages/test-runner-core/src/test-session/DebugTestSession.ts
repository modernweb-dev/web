import { BasicTestSession } from './BasicTestSession.js';

export interface DebugTestSession extends BasicTestSession {
  debug: true;
}
