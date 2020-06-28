import { Middleware } from 'koa';
import { Plugin } from './Plugin';

export interface Config {
  // Server configuration
  port: number;
  rootDir: string;
  hostname: string;
  basePath?: string;
  appIndex?: string;

  middleware: Middleware[];
  plugins: Plugin[];

  http2?: boolean;
  sslKey?: string;
  sslCert?: string;

  injectMessageChannel?: boolean;
}
