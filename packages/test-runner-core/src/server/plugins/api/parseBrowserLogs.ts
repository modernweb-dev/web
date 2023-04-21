import { deserialize, MapStackLocation } from '@web/browser-logs';
import { MapBrowserUrl } from '@web/browser-logs/src/parseStackTrace';

import { TestRunnerCoreConfig } from '../../../config/TestRunnerCoreConfig';
import { TestSession } from '../../../test-session/TestSession';
import { mapAsync } from '../../../utils/async';

interface BrowserLog {
  type: string;
  args: string[];
}

async function parseBrowserLog(
  browserLog: BrowserLog,
  mapBrowserUrl: MapBrowserUrl,
  mapStackLocation: MapStackLocation,
  config: TestRunnerCoreConfig,
) {
  const browserRootDir = config.rootDir;
  const args = await mapAsync(browserLog.args, arg =>
    deserialize(arg, { browserRootDir, mapBrowserUrl, mapStackLocation }),
  );
  return { type: browserLog.type, args };
}

export async function parseBrowserLogs(
  config: TestRunnerCoreConfig,
  mapBrowserUrl: MapBrowserUrl,
  mapStackLocation: MapStackLocation,
  result: Partial<TestSession>,
) {
  if (!result.logs) {
    return;
  }

  const browserLogs = result.logs as any as BrowserLog[];
  const logsWithType = await mapAsync(browserLogs, b =>
    parseBrowserLog(b, mapBrowserUrl, mapStackLocation, config),
  );

  const logs: any[][] = [];
  for (const log of logsWithType) {
    if (!config.filterBrowserLogs || config.filterBrowserLogs(log)) {
      logs.push(log.args);
    }
  }

  result.logs = logs;
}
