import { TestRunnerGroupConfig } from '@web/test-runner-core';
import { readConfig, ConfigLoaderError } from '@web/config-loader';
import globby from 'globby';
import { TestRunnerStartError } from '../TestRunnerStartError';

function validateGroupConfig(configFilePath: string, config: Partial<TestRunnerGroupConfig>) {
  if (config.browsers != null && !Array.isArray(config.browsers)) {
    throw new TestRunnerStartError(
      `Group config at ${configFilePath} has invalid browsers option. It should be an array.`,
    );
  }

  if (config.files != null && !(typeof config.files === 'string' || Array.isArray(config.files))) {
    throw new TestRunnerStartError(
      `Group config at ${configFilePath} has an invalid files option. It should be a string or an array.`,
    );
  }

  return { name: configFilePath, configFilePath, ...config } as TestRunnerGroupConfig;
}

export async function collectGroupConfigs(patterns: string[]) {
  const groupConfigFiles = new Set<string>();
  const groupConfigs: TestRunnerGroupConfig[] = [];

  for (const pattern of patterns) {
    const filePaths = globby.sync(pattern, { absolute: true });
    for (const filePath of filePaths) {
      groupConfigFiles.add(filePath);
    }
  }

  for (const groupConfigFile of groupConfigFiles) {
    try {
      const maybeGroupConfig = (await readConfig(
        '',
        groupConfigFile,
      )) as Partial<TestRunnerGroupConfig>;
      const groupConfig = validateGroupConfig(groupConfigFile, maybeGroupConfig);
      groupConfigs.push(groupConfig);
    } catch (error) {
      if (error instanceof ConfigLoaderError) {
        throw new TestRunnerStartError(error.message);
      }
      throw error;
    }
  }

  return groupConfigs;
}
