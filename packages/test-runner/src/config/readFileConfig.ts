import { readConfig, ConfigLoaderError } from '@web/config-loader';

import { TestRunnerStartError } from '../TestRunnerStartError.js';

export interface ReadFileConfigParams {
  /**
   * The config name to use. Defaults to web-test-runner.config.{mjs,cjs,js}
   */
  configName?: string;
  /**
   * Path to the config file. If this is not set, the config is looked up in the
   * current working directory using the config name.
   */
  configPath?: string;
}

/**
 * Reads the config from disk, defaults to process.cwd() + web-test-runner.config.{mjs,js,cjs} or
 * a custom config path.
 * @param customConfig the custom location to read the config from
 */

export async function readFileConfig({
  configName = 'web-test-runner.config',
  configPath,
}: ReadFileConfigParams = {}) {
  try {
    return await readConfig(configName, typeof configPath === 'string' ? configPath : undefined);
  } catch (error) {
    if (error instanceof ConfigLoaderError) {
      throw new TestRunnerStartError(error.message);
    }
    throw error;
  }
}
