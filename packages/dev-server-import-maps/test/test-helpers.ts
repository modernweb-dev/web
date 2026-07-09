import type { Plugin } from '@web/dev-server-core';

export function virtualFilesPlugin(servedFiles: Record<string, string>): Plugin {
  return {
    name: 'test-helpers-virtual-files',
    serve(context) {
      if (context.path in servedFiles) {
        return servedFiles[context.path];
      }
    },
  };
}
