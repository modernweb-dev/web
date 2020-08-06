import { Middleware } from '@web/dev-server-core';
import { TestRunnerPlugin } from './TestRunnerPlugin';

export interface TestRunnerServerConfig {
  debug?: boolean;
  plugins?: TestRunnerPlugin[];
  middleware?: Middleware[];
}
