import { Middleware, MimeTypeMappings } from '@web/dev-server-core';
import { TestRunnerPlugin } from './TestRunnerPlugin';

export interface TestRunnerServerConfig {
  debug?: boolean;
  mimeTypes?: MimeTypeMappings;
  plugins?: TestRunnerPlugin[];
  middleware?: Middleware[];
}
