import { DevServerCoreConfig } from '@web/dev-server-core';
import { RollupNodeResolveOptions } from '@rollup/plugin-node-resolve';

export interface DevServerConfig extends DevServerCoreConfig {
  /**
   * Whether to resolve module imports using node resolve.
   */
  nodeResolve?: boolean | RollupNodeResolveOptions;
  /**
   * Whether to preserve symlinks when resolving module imports.
   */
  preserveSymlinks?: boolean;
  /**
   * Whether to catch the file system and reload the brower on changes.
   */
  watch?: boolean;
  /**
   * Whether to clear the terminal when watch mode reloads the browser.
   * Defaults to true.
   */
  clearTerminalOnReload?: boolean;
  /**
   * JS language target to compile down to using esbuild. Recommended value is "auto", which compiles based on user agent. Check the docs for more options.
   */
  esbuildTarget?: string | string[];
  /**
   * Whether to open the browser on start. This can be a boolean, or a path to open the browser on.
   * If the `appIndex` option is set, setting `open` to true will use the app index value as open path.
   */
  open?: 'string' | boolean;
  /**
   * Whether to log debug messages.
   */
  debug?: boolean;
}
