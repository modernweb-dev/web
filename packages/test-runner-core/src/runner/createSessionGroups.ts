import { nanoid } from 'nanoid';
import path from 'path';

import { SESSION_STATUS } from '../test-session/TestSessionStatus.js';
import { TestSession } from '../test-session/TestSession.js';
import { TestRunnerCoreConfig } from '../config/TestRunnerCoreConfig.js';
import { TestRunnerGroupConfig } from '../config/TestRunnerGroupConfig.js';
import { BrowserLauncher } from '../browser-launcher/BrowserLauncher.js';
import { collectTestFiles } from './collectTestFiles.js';
import { TestSessionGroup } from '../test-session/TestSessionGroup.js';

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
      testRunnerHtml: config.testRunnerHtml,
      browsers: config.browsers,
      files: config.files ?? [],
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

    if (groupConfig.testRunnerHtml != null) {
      mergedGroupConfig.testRunnerHtml = groupConfig.testRunnerHtml;
    }

    groups.push(mergedGroupConfig);
  }

  const sessionGroups: TestSessionGroup[] = [];
  const testSessions: TestSession[] = [];
  const testFiles = new Set<string>();
  const browsers = new Set<BrowserLauncher>();

  for (const group of groups) {
    const baseDir = group.configFilePath ? path.dirname(group.configFilePath) : process.cwd();
    const testFilesForGroup = collectTestFiles(group.files, baseDir)
      // Normalize file path because glob returns windows paths with forward slashes:
      // C:/foo/bar -> C:\foo\bar
      .map(testFile => path.normalize(testFile));

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
      testRunnerHtml: group.testRunnerHtml,
      sessionIds: [],
    };

    for (const browser of group.browsers) {
      browsers.add(browser);
    }

    for (const testFile of testFilesForGroup) {
      for (const browser of group.browsers) {
        const session: TestSession = {
          id: nanoid(),
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

  if (testFiles.size === 0 || testSessions.length === 0) {
    throw new Error('Did not find any tests to run.');
  }

  return {
    sessionGroups,
    testSessions,
    testFiles: Array.from(testFiles),
    browsers: Array.from(browsers),
  };
}
