import { Middleware } from 'koa';
import { Plugin } from '../plugins/Plugin';

export type MimeTypeMappings = Record<string, string>;

export interface DevServerCoreConfig {
  /**
   * The port to run the server on.
   */
  port: number;
  /**
   * Root directory to serve files from. All served files must be accessible with
   * this directory. If you are in a monorepository, you may need to set the to
   * the root of the repository.
   */
  rootDir: string;
  /**
   * Hostname to bind the server to.
   */
  hostname: string;
  basePath?: string;
  /**
   * The app's index.html file. When set, serves the index.html for non-file requests. Use this to enable SPA routing
   */
  appIndex?: string;

  /**
   * Files to serve with a different mime type
   */
  mimeTypes?: MimeTypeMappings;
  /**
   * Middleware used by the server to modify requests/responses, for example to proxy
   * requests or rewrite urls
   */
  middleware?: Middleware[];
  /**
   * Plugins used by the server to serve or transform files
   */
  plugins?: Plugin[];

  /**
   * Whether to run the server with HTTP2
   */
  http2?: boolean;
  /**
   * Path to SSL key
   */
  sslKey?: string;
  /**
   * Path to SSL certificate
   */
  sslCert?: string;

  /**
   * Whether to inject a script to set up a web socket connection into pages served
   * by the dev server. Defaults to true.
   */
  injectWebSocket?: boolean;
}
