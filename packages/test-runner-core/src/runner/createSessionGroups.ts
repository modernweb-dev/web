import { v4 as uuid } from 'uuid';
import path from 'path';

import { SESSION_STATUS } from '../test-session/TestSessionStatus';
import { TestSession } from '../test-session/TestSession';
import { TestRunnerCoreConfig } from '../config/TestRunnerCoreConfig';
import { TestRunnerGroupConfig } from '../config/TestRunnerGroupConfig';
import { BrowserLauncher } from '../browser-launcher/BrowserLauncher';
import { collectTestFiles } from './collectTestFiles';
import { TestSessionGroup } from '../test-session/TestSessionGroup';

interface GroupConfigWithoutOptionals extends TestRunnerGroupConfig {
  name: string;
  configFilePath?: string;
  files: string | string[];
  browsers: BrowserLauncher[];
}

export function createTestSessions(
  config: TestRunnerCoreConfig,
  groupConfigs: TestRunnerGroupConfig[],
) {
  const groups: GroupConfigWithoutOptionals[] = [];

  if (config.files) {
    groups.push({
      name: 'default',
      files: config.files,
      browsers: config.browsers,
    });
  }

  for (const groupConfig of groupConfigs) {
    // merge group with config defaults
    const mergedGroupConfig: GroupConfigWithoutOptionals = {
      name: groupConfig.name,
      configFilePath: groupConfig.configFilePath,
      browsers: config.browsers,
      files: config.files,
    };

    if (typeof mergedGroupConfig.name !== 'string') {
      throw new Error('Group in config is missing a name.');
    }

    if (groupConfig.browsers != null) {
      mergedGroupConfig.browsers = groupConfig.browsers;
    }

    if (groupConfig.files != null) {
      mergedGroupConfig.files = groupConfig.files;
    }

    groups.push(mergedGroupConfig);
  }

  const sessionGroups: TestSessionGroup[] = [];
  const testSessions: TestSession[] = [];
  const testFiles = new Set<string>();
  const browsers: BrowserLauncher[] = [];

  for (const group of groups) {
    const baseDir = group.configFilePath ? path.dirname(group.configFilePath) : process.cwd();
    const testFilesForGroup = collectTestFiles(group.files, baseDir);

    if (testFilesForGroup.length === 0) {
      throw new Error(`Could not find any test files with pattern(s): ${group.files}`);
    }

    for (const file of testFilesForGroup) {
      testFiles.add(file);
    }

    const sessionGroup: TestSessionGroup = {
      name: group.name,
      browsers: group.browsers,
      testFiles: testFilesForGroup,
      sessionIds: [],
    };

    browsers.push(...group.browsers);

    for (const testFile of testFilesForGroup) {
      for (const browser of group.browsers) {
        const session: TestSession = {
          id: uuid(),
          group: sessionGroup,
          debug: false,
          testRun: -1,
          browser,
          status: SESSION_STATUS.SCHEDULED,
          testFile,
          errors: [],
          logs: [],
          request404s: [],
        };

        testSessions.push(session);
        sessionGroup.sessionIds.push(session.id);
      }
    }
  }

  return { sessionGroups, testSessions, testFiles: Array.from(testFiles), browsers };
}
