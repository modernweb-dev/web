import { Plugin, Middleware } from '@web/dev-server-core';

export interface TestRunnerServerConfig {
  debug?: boolean;
  plugins?: Plugin[];
  middleware?: Middleware[];
}
