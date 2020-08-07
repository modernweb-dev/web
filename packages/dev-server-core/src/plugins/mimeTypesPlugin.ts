import picoMatch from 'picomatch';
import { isAbsolute, posix } from 'path';

import { MimeTypeMappings } from '../DevServerCoreConfig';
import { Plugin } from '../Plugin';
import { getRequestFilePath } from '../utils';

function createMatcher(rootDir: string, pattern: string) {
  const resolvedPattern =
    !isAbsolute(pattern) && !pattern.startsWith('*') ? posix.join(rootDir, pattern) : pattern;
  return picoMatch(resolvedPattern);
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

      for (const [pattern, mimeType] of Object.entries(mappings)) {
        matchers.push({ fn: createMatcher(rootDir, pattern), mimeType });
      }
    },

    resolveMimeType(context) {
      const filePath = getRequestFilePath(context, rootDir);
      for (const matcher of matchers) {
        if (matcher.fn(filePath)) {
          return matcher.mimeType;
        }
      }
    },
  };
}
