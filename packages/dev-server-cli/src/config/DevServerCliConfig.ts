import { DevServerCoreConfig } from '@web/dev-server-core';

export interface DevServerCliConfig extends DevServerCoreConfig {
  open?: 'string' | boolean;
  appIndex?: string;
}
