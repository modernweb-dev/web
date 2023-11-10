import picoMatch from 'picomatch';
import { isAbsolute, posix, sep } from 'path';

import { MimeTypeMappings } from '../server/DevServerCoreConfig';
import { Plugin } from './Plugin.js';
import { getRequestFilePath } from '../utils.js';

function createMatcher(rootDir: string, pattern: string) {
  const resolvedPattern =
    !isAbsolute(pattern) && !pattern.startsWith('*') ? posix.join(rootDir, pattern) : pattern;
  return picoMatch(resolvedPattern, { dot: true });
}

interface Matcher {
  fn: (test: string) => boolean;
  mimeType: string;
}

export function mimeTypesPlugin(mappings: MimeTypeMappings): Plugin {
  const matchers: Matcher[] = [];
  let rootDir: string;

  return {
    name: 'mime-types',

    serverStart({ config }) {
      ({ rootDir } = config);
      const matcherBaseDir = config.rootDir.split(sep).join('/');

      for (const [pattern, mimeType] of Object.entries(mappings)) {
        matchers.push({ fn: createMatcher(matcherBaseDir, pattern), mimeType });
      }
    },

    resolveMimeType(context) {
      const filePath = getRequestFilePath(context.url, rootDir);
      for (const matcher of matchers) {
        if (matcher.fn(filePath)) {
          return matcher.mimeType;
        }
      }
    },
  };
}
